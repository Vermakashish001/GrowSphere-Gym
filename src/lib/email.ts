// @ts-ignore - nodemailer types not available
import nodemailer from "nodemailer";

// Email options interface
interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Create a reusable transporter object using SMTP transport
 */
function createTransporter() {
  // Check if email configuration is set
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn("Email configuration not found. Emails will be logged to console instead.");
    return null;
  }

  const port = parseInt(process.env.EMAIL_PORT || "465");
  
  const smtpConfig: any = {
    host: process.env.EMAIL_HOST,
    port: port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Enhanced Zoho/Gmail compatibility settings
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
    pool: false, // Disable connection pooling
    maxConnections: 1, // Use single connection
    maxMessages: 1, // Send one message per connection
    // TLS settings for certificate validation issues
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates
      minVersion: 'TLSv1.2'
    }
  };

  // For port 587, add STARTTLS settings
  if (port === 587) {
    smtpConfig.requireTLS = true;
  }

  // @ts-ignore - nodemailer types issue
  return nodemailer.createTransport(smtpConfig);
}

/**
 * Send an email
 * @param options Email options (to, subject, text, html)
 * @returns Promise with send result
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const transporter = createTransporter();

  // If no transporter, log to console instead (development mode)
  if (!transporter) {
    console.log("\n" + "=".repeat(60));
    console.log("📧 EMAIL (Development Mode - Not Sent)");
    console.log("=".repeat(60));
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log("-".repeat(60));
    if (options.text) {
      console.log("Text Content:");
      console.log(options.text);
    }
    if (options.html) {
      console.log("\nHTML Content:");
      console.log(options.html);
    }
    console.log("=".repeat(60) + "\n");
    return true;
  }

  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "GrowSphere"}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Send password reset email
 * @param email User's email address
 * @param resetUrl Password reset URL with token
 * @returns Promise with send result
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<boolean> {
  const subject = "Reset Your GrowSphere Password";
  
  const text = `
Hello,

You requested to reset your password for your GrowSphere account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email or contact support if you have concerns.

Best regards,
The GrowSphere Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2ea4ff 0%, #1e90ff 100%); padding: 48px 20px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.1); padding: 12px 24px; border-radius: 50px; backdrop-filter: blur(10px);">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">GrowSphere</h1>
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Reset Your Password</h2>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                You requested to reset your password for your GrowSphere account. Click the button below to create a new password.
              </p>
              
              <!-- Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #2ea4ff 0%, #1e90ff 100%); box-shadow: 0 4px 12px rgba(46, 164, 255, 0.3);">
                    <button style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Reset Password →
                    </button>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 12px 0; color: #64748b; font-size: 14px; line-height: 1.6; font-weight: 500;">
                Or copy and paste this link into your browser:
              </p>
              <div style="margin: 0 0 32px 0; padding: 16px; background-color: #f1f5f9; border-radius: 8px; border-left: 4px solid #2ea4ff;">
                <p style="margin: 0; word-break: break-all; font-size: 13px; color: #475569; font-family: 'Courier New', monospace;">
                  ${resetUrl}
                </p>
              </div>
              
              <div style="margin-top: 32px; padding: 20px; background-color: #eff6ff; border-radius: 12px; border: 1px solid #bfdbfe;">
                <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; line-height: 1.6; font-weight: 600;">
                  ⏱️ This link expires in 1 hour
                </p>
                <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
                  If you didn't request this password reset, please ignore this email or contact support if you have concerns.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; font-weight: 500;">
                &copy; ${new Date().getFullYear()} GrowSphere. All rights reserved.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 13px;">
                Gym Management Made Simple
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Send welcome email to new users
 * @param email User's email address
 * @param firstName User's first name
 * @param gymName Gym name
 * @returns Promise with send result
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  gymName: string
): Promise<boolean> {
  const subject = `Welcome to GrowSphere, ${firstName}!`;
  
  const text = `
Hello ${firstName},

Welcome to GrowSphere!

Your gym "${gymName}" has been successfully created. You can now start managing your gym operations with our powerful dashboard.

Here's what you can do:
• Add and manage members
• Schedule classes and manage instructors
• Track payments and billing
• Monitor gym analytics
• And much more!

Get started: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard

If you have any questions, feel free to reach out to our support team.

Best regards,
The GrowSphere Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to GrowSphere</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2ea4ff 0%, #1e90ff 100%); padding: 48px 20px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.1); padding: 12px 24px; border-radius: 50px; backdrop-filter: blur(10px);">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">GrowSphere</h1>
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Welcome to GrowSphere, ${firstName}!</h2>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Your gym <strong style="color: #0f172a;">"${gymName}"</strong> has been successfully created on GrowSphere. You're now ready to streamline your gym management operations!
              </p>
              
              <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; padding: 28px; margin: 32px 0; border: 1px solid #bfdbfe;">
                <h3 style="margin: 0 0 16px 0; color: #1e40af; font-size: 18px; font-weight: 700;">What you can do:</h3>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #2ea4ff; font-weight: 700; margin-right: 8px;">✓</span>
                      <span style="color: #475569; font-size: 15px;">Add and manage members</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #2ea4ff; font-weight: 700; margin-right: 8px;">✓</span>
                      <span style="color: #475569; font-size: 15px;">Schedule classes and manage instructors</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #2ea4ff; font-weight: 700; margin-right: 8px;">✓</span>
                      <span style="color: #475569; font-size: 15px;">Track payments and billing</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #2ea4ff; font-weight: 700; margin-right: 8px;">✓</span>
                      <span style="color: #475569; font-size: 15px;">Monitor gym analytics</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #2ea4ff; font-weight: 700; margin-right: 8px;">✓</span>
                      <span style="color: #475569; font-size: 15px;">And much more!</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #2ea4ff 0%, #1e90ff 100%); box-shadow: 0 4px 12px rgba(46, 164, 255, 0.3);">
                    <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Go to Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Need help? Our support team is here to assist you every step of the way.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; font-weight: 500;">
                &copy; ${new Date().getFullYear()} GrowSphere. All rights reserved.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 13px;">
                Gym Management Made Simple
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendEmail({ to: email, subject, text, html });
}
/**
 * Send email change verification email
 */
export async function sendEmailChangeVerification(
  newEmail: string,
  firstName: string,
  oldEmail: string,
  token: string
): Promise<boolean> {
  const subject = `Verify your new email address - GrowSphere`;
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email-change?token=${token}`;
  
  const text = `
Hello ${firstName},

You requested to change your GrowSphere email address from ${oldEmail} to ${newEmail}.

To complete this change, please click the link below:
${verifyUrl}

This link will expire in 24 hours.

If you didn't request this change, please ignore this email and your email address will remain unchanged.

Best regards,
The GrowSphere Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          <tr>
            <td style="background: linear-gradient(135deg, #2ea4ff 0%, #1e90ff 100%); padding: 48px 20px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.1); padding: 12px 24px; border-radius: 50px; backdrop-filter: blur(10px);">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">GrowSphere</h1>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 48px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Verify your new email</h2>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Hello <strong>${firstName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                You requested to change your email address from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.
              </p>
              <p style="margin: 0 0 32px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                To complete this change, please click the button below:
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 0 0 32px 0;">
                    <a href="${verifyUrl}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #2ea4ff 0%, #1e90ff 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(46, 164, 255, 0.3);">
                      Verify New Email
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 8px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>Important:</strong> This link will expire in 24 hours.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">
                &copy; ${new Date().getFullYear()} GrowSphere. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendEmail({ to: newEmail, subject, text, html });
}
