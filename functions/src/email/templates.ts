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

/** Secondary muted button (for share / copy link sections). */
function secondaryButton(href: string, label: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:12px 0 4px;">
      <a href="${href}" target="_blank"
         style="display:inline-block;background:#FFFFFF;color:#1B6B2E;font-size:14px;font-weight:600;
                text-decoration:none;padding:10px 28px;border-radius:8px;
                border:2px solid #1B6B2E;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

// ── Public template functions ────────────────────────────────────────────────

export function businessRegistrationEmailHtml(
  ownerName: string,
  businessName: string,
  category: string,
  city: string,
  listingUrl: string,
): string {
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  return layout(`
    <h2 style="margin:0 0 16px;font-size:20px;color:#1B5E20;">Your Business Is Live! 🎉</h2>
    <p style="margin:0 0 12px;font-size:15px;color:#333333;line-height:1.6;">
      Hi <strong>${ownerName}</strong>,
    </p>
    <p style="margin:0 0 20px;font-size:15px;color:#333333;line-height:1.6;">
      Congratulations! Your business <strong>"${businessName}"</strong> is now listed
      on DiaspoAfricConnect and visible to the community.
    </p>

    <!-- Business summary card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background:#F8FFF8;border:1px solid #E0E0E0;border-radius:8px;margin-bottom:20px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:13px;color:#777777;">BUSINESS NAME</p>
          <p style="margin:0 0 12px;font-size:16px;color:#333333;font-weight:600;">${businessName}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#777777;">CATEGORY</p>
          <p style="margin:0 0 12px;font-size:16px;color:#333333;">${capitalizedCategory}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#777777;">LOCATION</p>
          <p style="margin:0;font-size:16px;color:#333333;">${city}</p>
        </td>
      </tr>
    </table>

    ${ctaButton(escapeHtmlAttr(listingUrl), "View Your Listing")}

    <!-- Share section -->
    <div style="margin-top:28px;padding-top:20px;border-top:1px solid #EEEEEE;">
      <p style="margin:0 0 8px;font-size:15px;color:#1B5E20;font-weight:600;">📤 Share Your Listing</p>
      <p style="margin:0 0 12px;font-size:14px;color:#333333;line-height:1.5;">
        Copy this link and share it with your community, on social media, or via WhatsApp:
      </p>
      <p style="margin:0 0 12px;font-size:13px;color:#1B6B2E;word-break:break-all;line-height:1.4;
                background:#F5F5F5;padding:10px 14px;border-radius:6px;">
        ${escapeHtmlAttr(listingUrl)}
      </p>
    </div>

    <!-- Next steps -->
    <div style="margin-top:20px;padding-top:20px;border-top:1px solid #EEEEEE;">
      <p style="margin:0 0 10px;font-size:15px;color:#1B5E20;font-weight:600;">💡 Next Steps</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;color:#333333;line-height:1.8;">
        <tr><td style="padding:2px 0;">📸&nbsp; Add photos to attract more customers</td></tr>
        <tr><td style="padding:2px 0;">⭐&nbsp; Ask happy customers to leave reviews</td></tr>
        <tr><td style="padding:2px 0;">✅&nbsp; Verify your business to earn a trust badge</td></tr>
      </table>
    </div>
  `);
}

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
