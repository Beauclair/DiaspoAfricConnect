/**
 * Config plugin to enable R8 full-mode shrinking + obfuscation for release builds.
 * This satisfies Google Play's DEX code optimization requirements.
 *
 * Sets:
 *   - minifyEnabled true  (enables R8 shrinking & obfuscation)
 *   - shrinkResources true (removes unused resources)
 *   - proguardFiles with default rules + custom keep rules
 */
const { withAppBuildGradle, withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withProguardObfuscation(config) {
  // Step 1: Copy proguard-rules.pro into android/app/
  config = withDangerousMod(config, [
    'android',
    (config) => {
      const srcPath = path.resolve(__dirname, '..', 'proguard-rules.pro');
      const destPath = path.join(config.modRequest.platformProjectRoot, 'app', 'proguard-rules.pro');

      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
      return config;
    },
  ]);

  // Step 2: Enable minify + shrink in the release buildType
  config = withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    // Check if already patched
    if (buildGradle.includes('// [Obfuscation Plugin]')) {
      return config;
    }

    config.modResults.contents = buildGradle.replace(
      /buildTypes\s*\{[\s\S]*?release\s*\{/,
      (match) =>
        match +
        `
            // [Obfuscation Plugin] — enable R8 shrinking & obfuscation
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'`
    );

    return config;
  });

  return config;
}

module.exports = withProguardObfuscation;
