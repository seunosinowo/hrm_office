import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || '';
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const smtpFrom = process.env.SMTP_FROM || 'no-reply@hrmoffice.local';
const smtpDebug = (process.env.SMTP_DEBUG || '').toLowerCase() === 'true';

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
      // For Gmail on 587 use STARTTLS (secure:false + requireTLS:true). On 465 use implicit TLS.
      secure: smtpPort === 465,
      requireTLS: smtpPort !== 465,
      auth: { user: smtpUser, pass: smtpPass },
      // Enable pooling to reuse connections and improve reliability
      pool: true,
      // Extra-tolerant timeouts for free tiers (Render free can delay >50s)
      connectionTimeout: 120000,
      greetingTimeout: 60000,
      socketTimeout: 120000,
      // Ensure modern TLS when upgrading from STARTTLS
      tls: {
        minVersion: 'TLSv1.2',
        servername: smtpHost,
      },
      // Optional verbose logs controlled via env
      logger: smtpDebug,
      name: 'hrmoffice-backend',
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
  const maxRetries = Number(process.env.SMTP_RETRIES || 3);
  let attempt = 0;
  const payload = { from: smtpFrom, to, subject, html } as any;
  while (true) {
    try {
      return await tx.sendMail(payload);
    } catch (err: any) {
      attempt += 1;
      const code = err?.code || '';
      const msg = String(err?.message || err);
      const retryableCodes = ['ETIMEDOUT', 'ECONNRESET', 'EHOSTUNREACH', 'ESOCKET', 'ECONNREFUSED'];
      const isRetryable = retryableCodes.includes(code) || /timeout|greeting|connection\sclosed/i.test(msg);
      console.error(`[mailer] sendMail attempt ${attempt} failed (${code}):`, msg);
      if (!isRetryable || attempt > maxRetries) {
        throw err;
      }
      const delayMs = Math.min(30000, 1000 * Math.pow(2, attempt));
      await new Promise((r) => setTimeout(r, delayMs));
    }
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