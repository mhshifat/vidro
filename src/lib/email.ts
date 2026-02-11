import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SYSTEM_SMTP_HOST,
  port: parseInt(process.env.SYSTEM_SMTP_PORT || "465"),
  secure: process.env.SYSTEM_SMTP_SECURE === "true",
  auth: {
    user: process.env.SYSTEM_SMTP_USER,
    pass: process.env.SYSTEM_SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(
  email: string,
  verificationLink: string,
  name: string
): Promise<void> {
  const fromEmail = process.env.SYSTEM_SMTP_FROM_EMAIL || "noreply@vidro.dev";

  await transporter.sendMail({
    from: fromEmail,
    to: email,
    subject: "Verify your Vidro account",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #1a1a1a; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 20px; }
          .logo-icon { width: 32px; height: 32px; background: #ef4444; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
          .logo-icon::before { content: "●"; color: white; font-size: 20px; font-weight: bold; }
          .logo-text { font-size: 20px; font-weight: bold; }
          .content { background: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 30px; }
          .content h1 { margin: 0 0 15px 0; font-size: 24px; }
          .content p { margin: 0 0 15px 0; color: #666; }
          .verification-link { text-align: center; margin: 30px 0; }
          .btn { display: inline-block; background: #ef4444; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
          .btn:hover { background: #dc2626; }
          .expiry { color: #999; font-size: 13px; margin-top: 20px; }
          .footer { text-align: center; color: #999; font-size: 13px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <div class="logo-icon"></div>
              <span class="logo-text">Vidro</span>
            </div>
          </div>

          <div class="content">
            <h1>Verify your email</h1>
            <p>Hi ${name || "there"},</p>
            <p>Thanks for signing up for Vidro! To complete your registration and start recording bug reports, please verify your email address.</p>
            
            <div class="verification-link">
              <a href="${verificationLink}" class="btn">Verify Email</a>
            </div>

            <p style="margin-top: 20px;">Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #0066cc; font-size: 12px;">${verificationLink}</p>

            <p class="expiry">This link expires in 24 hours.</p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Vidro. All rights reserved.</p>
            <p><a href="https://vidro.dev/privacy" style="color: #0066cc; text-decoration: none;">Privacy Policy</a> · <a href="https://vidro.dev/terms" style="color: #0066cc; text-decoration: none;">Terms of Service</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Verify your Vidro account

Hi ${name || "there"},

Thanks for signing up for Vidro! To complete your registration and start recording bug reports, please verify your email address by clicking the link below:

${verificationLink}

This link expires in 24 hours.

© ${new Date().getFullYear()} Vidro. All rights reserved.
    `,
  });
}
