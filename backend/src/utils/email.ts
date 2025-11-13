import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || '';
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const smtpFrom = process.env.SMTP_FROM || 'no-reply@hrmoffice.local';

let transporter: nodemailer.Transporter | null = null;

export function getTransporter() {
  if (!transporter) {
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn('[mailer] SMTP env not fully configured. Emails will be logged to console only.');
      return null;
    }
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      // Use STARTTLS for 587; keep TLS for 465
      secure: smtpPort === 465,
      requireTLS: smtpPort !== 465,
      auth: { user: smtpUser, pass: smtpPass },
      // Conservative timeouts to avoid hanging on providers blocking SMTP
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
    // Verify transporter connection early so errors are logged at startup
    transporter.verify()
      .then(() => console.info('[mailer] SMTP transporter verified'))
      .catch(err => console.error('[mailer] SMTP verify failed:', err));
  }
  return transporter;
}

export async function sendMail(to: string, subject: string, html: string) {
  const tx = getTransporter();
  if (!tx) {
    console.log('[mailer] Simulated email:', { to, subject, html });
    return { simulated: true } as any;
  }
  try {
    return await tx.sendMail({ from: smtpFrom, to, subject, html });
  } catch (err) {
    console.error('[mailer] sendMail error:', err);
    throw err;
  }
}

export function buildWelcomeEmail(orgName: string) {
  return {
    subject: `Welcome to ${orgName}!`,
    html: `<div style="font-family: Arial, sans-serif;">
      <h2>Welcome to ${orgName}</h2>
      <p>Your organization has been created successfully in HRM Office.</p>
      <p>You can now sign in and start setting things up.</p>
    </div>`
  };
}

export function buildResetEmail(orgName: string, resetLink: string) {
  return {
    subject: `${orgName}: Reset your password`,
    html: `<div style="font-family: Arial, sans-serif;">
      <h2>Password reset</h2>
      <p>We received a request to reset your password for ${orgName}.</p>
      <p>This link will expire in 24 hours.</p>
      <p><a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px">Reset password</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>`
  };
}

export function buildVerifyEmail(orgName: string, verifyLink: string) {
  return {
    subject: `${orgName}: Verify your email address`,
    html: `<div style="font-family: Arial, sans-serif;">
      <h2>Verify your email</h2>
      <p>Thanks for signing up to ${orgName} on HRM Office.</p>
      <p>Please confirm your email address to activate your account.</p>
      <p><a href="${verifyLink}" style="display:inline-block;padding:10px 16px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px">Verify email</a></p>
      <p>This link will expire in 24 hours. If you didn’t create an account, ignore this email.</p>
    </div>`
  };
}