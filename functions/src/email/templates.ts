/* ─────────────────────────────────────────────────────────────────────────────
 * Branded HTML email templates for DiaspoAfricConnect.
 *
 * Design tokens:
 *   Primary green  #1B6B2E
 *   Deep green     #1B5E20
 *   Gold CTA       #F9A825
 *   Background     #F5F5F5
 *   Card white     #FFFFFF
 *   Body text      #333333
 *   Muted text     #777777
 * ──────────────────────────────────────────────────────────────────────────── */

/** Shared wrapper that both templates use. */
function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DiaspoAfricConnect</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1B6B2E,#2E7D32);padding:28px 24px;text-align:center;">
              <span style="font-size:36px;">🌍</span>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:0.3px;">DiaspoAfricConnect</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 28px 36px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 28px 24px;border-top:1px solid #EEEEEE;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;color:#777777;">A community platform for the African diaspora</p>
              <p style="margin:0;font-size:12px;color:#AAAAAA;">© ${new Date().getFullYear()} DiaspoAfricConnect. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Gold call-to-action button. */
function ctaButton(href: string, label: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:28px 0 4px;">
      <a href="${href}" target="_blank"
         style="display:inline-block;background:#F9A825;color:#FFFFFF;font-size:16px;font-weight:700;
                text-decoration:none;padding:14px 36px;border-radius:8px;
                box-shadow:0 2px 4px rgba(0,0,0,0.12);">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

/** Escape `&` for safe use inside an HTML attribute value. */
function escapeHtmlAttr(url: string): string {
  return url.replace(/&/g, "&amp;");
}

// ── Public template functions ────────────────────────────────────────────────

export function verificationEmailHtml(
  userName: string,
  verifyLink: string,
): string {
  return layout(`
    <h2 style="margin:0 0 16px;font-size:20px;color:#1B5E20;">Verify Your Email</h2>
    <p style="margin:0 0 12px;font-size:15px;color:#333333;line-height:1.6;">
      Hi <strong>${userName}</strong>,
    </p>
    <p style="margin:0 0 8px;font-size:15px;color:#333333;line-height:1.6;">
      Welcome to DiaspoAfricConnect! Please confirm your email address by
      clicking the button below.
    </p>
    ${ctaButton(escapeHtmlAttr(verifyLink), "Verify Email Address")}
    <p style="margin:24px 0 0;font-size:13px;color:#777777;line-height:1.5;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin:4px 0 0;font-size:12px;color:#1B6B2E;word-break:break-all;line-height:1.4;">
      ${escapeHtmlAttr(verifyLink)}
    </p>
    <p style="margin:20px 0 0;font-size:13px;color:#AAAAAA;line-height:1.5;">
      If you didn't create an account, you can safely ignore this email.
    </p>
  `);
}

export function passwordResetEmailHtml(
  userName: string,
  resetLink: string,
): string {
  return layout(`
    <h2 style="margin:0 0 16px;font-size:20px;color:#1B5E20;">Reset Your Password</h2>
    <p style="margin:0 0 12px;font-size:15px;color:#333333;line-height:1.6;">
      Hi <strong>${userName}</strong>,
    </p>
    <p style="margin:0 0 8px;font-size:15px;color:#333333;line-height:1.6;">
      We received a request to reset your password. Click the button below to
      choose a new one.
    </p>
    ${ctaButton(escapeHtmlAttr(resetLink), "Reset Password")}
    <p style="margin:24px 0 0;font-size:13px;color:#777777;line-height:1.5;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin:4px 0 0;font-size:12px;color:#1B6B2E;word-break:break-all;line-height:1.4;">
      ${escapeHtmlAttr(resetLink)}
    </p>
    <p style="margin:20px 0 0;font-size:13px;color:#AAAAAA;line-height:1.5;">
      If you didn't request a password reset, you can safely ignore this email.
      Your password will remain unchanged.
    </p>
  `);
}
