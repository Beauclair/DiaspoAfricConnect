const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ---------------------------------------------------------------------------
// Firebase fix for React Native / Expo Go
// ---------------------------------------------------------------------------
// Firebase JS SDK 10.x has two problems in Metro:
//
// 1. @firebase/auth is nested under firebase/node_modules/ and its wrapper
//    (firebase/auth) doesn't forward the "react-native" export condition,
//    so Metro picks the browser bundle which crashes on RN.
//
// 2. The @firebase/auth RN bundle is CJS (require('@firebase/app')), while
//    other Firebase wrappers are ESM (import from '@firebase/app'). Metro
//    resolves CJS `main` and ESM `browser` fields to different files,
//    creating two separate module instances of @firebase/app with separate
//    component registries → "Component auth has not been registered yet".
//
// Fix: redirect firebase/auth to the RN bundle, and pin all shared
// @firebase/* dependencies to their CJS entries so every package shares
// the exact same module instance.
// ---------------------------------------------------------------------------

const resolve = (rel) => path.resolve(__dirname, 'node_modules', rel);

const aliases = {
  // Use the React Native-specific auth bundle (CJS)
  'firebase/auth':       resolve('firebase/node_modules/@firebase/auth/dist/rn/index.js'),
  '@firebase/auth':      resolve('firebase/node_modules/@firebase/auth/dist/rn/index.js'),

  // Use the React Native-specific Firestore bundle
  // Without this, Metro picks the ESM browser bundle via the "browser" field,
  // which can break in Hermes and causes dual-instance issues with @firebase/app.
  'firebase/firestore':  resolve('@firebase/firestore/dist/index.rn.js'),
  '@firebase/firestore': resolve('@firebase/firestore/dist/index.rn.js'),

  // Pin shared deps to CJS so all consumers get the same instance
  '@firebase/app':       resolve('@firebase/app/dist/index.cjs.js'),
  '@firebase/util':      resolve('@firebase/util/dist/index.cjs.js'),
  '@firebase/logger':    resolve('@firebase/logger/dist/index.cjs.js'),
  '@firebase/component': resolve('@firebase/component/dist/index.cjs.js'),
};

// Verify all targets exist at startup
const fs = require('fs');
for (const [mod, target] of Object.entries(aliases)) {
  if (!fs.existsSync(target)) {
    console.warn(`[metro.config] WARNING: ${mod} target missing: ${target}`);
  }
}

const functionsAbsolute = path.resolve(__dirname, 'functions');
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Block any resolution from within the functions/ directory
  if (context.originModulePath && context.originModulePath.startsWith(functionsAbsolute)) {
    return { type: 'empty' };
  }
  if (aliases[moduleName]) {
    return { type: 'sourceFile', filePath: aliases[moduleName] };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Exclude Cloud Functions directory from Metro bundler entirely.
// firebase-admin and firebase-functions are server-only packages that use
// Node built-ins (fs, async_hooks) which don't exist in React Native.
const functionsEscaped = functionsAbsolute.replace(/[/\\]/g, '[/\\\\]');
config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  new RegExp(functionsEscaped + '($|[/\\\\].*)'),
  /^functions($|[/\\].*)/,
  /[/\\]functions[/\\]lib[/\\]/,
  /[/\\]functions[/\\]node_modules[/\\]/,
];

module.exports = config;
