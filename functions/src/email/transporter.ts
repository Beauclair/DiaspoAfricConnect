import * as nodemailer from "nodemailer";

/**
 * Creates a Nodemailer SMTP transporter.
 *
 * Reads credentials from environment variables populated by Firebase
 * Functions secrets at runtime.  Must be called inside a function handler
 * (not at module scope).
 */
function createTransporter() {
  const host = process.env.SMTP_HOST!;
  const port = parseInt(process.env.SMTP_PORT!, 10);

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // TLS for 465, STARTTLS for 587
    auth: {
      user: process.env.SMTP_EMAIL!,
      pass: process.env.SMTP_PASSWORD!,
    },
  });
}

/**
 * Send an HTML email via SMTP.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"DiaspoAfricConnect" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  });
}
