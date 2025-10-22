import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';
import { sendMail, buildWelcomeEmail, buildResetEmail, buildVerifyEmail } from '../utils/email';
import { generateToken, hashToken } from '../utils/tokens';

const router = Router();

// Organization signup + create HR admin user
router.post('/org/signup', async (req: Request, res: Response) => {
  try {
    const { organizationName, organizationEmail, slug, adminEmail, adminPassword, firstName, lastName, logoUrl, address } = req.body as {
      organizationName: string;
      organizationEmail: string;
      slug: string;
      adminEmail: string;
      adminPassword: string;
      firstName?: string;
      lastName?: string;
      logoUrl?: string;
      address?: string;
    };

    if (!organizationName || !organizationEmail || !slug || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const exists = await prisma.organization.findUnique({ where: { slug } });
    if (exists) return res.status(409).json({ error: 'Organization slug already exists' });

    const org = await prisma.organization.create({
      data: { name: organizationName, email: organizationEmail, slug, logoUrl, address },
    });

    const passwordHash = await hashPassword(adminPassword);
    const admin = await prisma.user.create({
      data: {
        organizationId: org.id,
        email: adminEmail,
        passwordHash,
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'HR',
      },
    });

    // Create and send email verification link for admin
    const rawToken = generateToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.emailVerificationToken.create({
      data: {
        organizationId: org.id,
        userId: admin.id,
        tokenHash,
        expiresAt,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyLink = `${frontendUrl}/auth/email-confirmation?token=${rawToken}`;
    const verifyTpl = buildVerifyEmail(org.name, verifyLink);
    try {
      await sendMail(adminEmail, verifyTpl.subject, verifyTpl.html);
    } catch (e) {
      console.error('[mailer] failed to send verification email:', e);
    }

    // Send welcome email to admin
    const welcome = buildWelcomeEmail(org.name);
    try {
      await sendMail(adminEmail, welcome.subject, welcome.html);
    } catch (e) {
      console.error('[mailer] failed to send welcome email:', e);
    }

    return res.status(201).json({
      user: { id: admin.id, email: admin.email, role: admin.role, organizationId: org.id },
      organization: { id: org.id, name: org.name, slug: org.slug, logoUrl: org.logoUrl },
      emailVerificationRequired: true,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to create organization' });
  }
});

// HR creates users (employee or assessor)
router.post('/signup', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: 'EMPLOYEE' | 'ASSESSOR' | 'HR';
    };

    if (!req.user || req.user.role !== 'HR') return res.status(403).json({ error: 'Only HR can create users' });
    if (!email || !password || !firstName || !lastName || !role) return res.status(400).json({ error: 'Missing required fields' });

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        organizationId: req.user!.organizationId,
        email,
        passwordHash,
        firstName,
        lastName,
        role,
      },
    });

    // Send verification to newly created non-HR users too
    const rawToken = generateToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.emailVerificationToken.create({
      data: { organizationId: req.user!.organizationId, userId: user.id, tokenHash, expiresAt },
    });
    const org = await prisma.organization.findUnique({ where: { id: req.user!.organizationId } });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyLink = `${frontendUrl}/auth/email-confirmation?token=${rawToken}`;
    const verifyTpl = buildVerifyEmail(org?.name || 'HRM Office', verifyLink);
    await sendMail(user.email, verifyTpl.subject, verifyTpl.html);

    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// Individual self-signup (public)
router.post('/individual/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, slug, firstName, lastName } = req.body as {
      email: string;
      password: string;
      slug: string;
      firstName?: string;
      lastName?: string;
    };
    if (!email || !password || !slug) return res.status(400).json({ error: 'Missing required fields' });

    const org = await prisma.organization.findUnique({ where: { slug } });
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    const exists = await prisma.user.findFirst({ where: { organizationId: org.id, email } });
    if (exists) return res.status(409).json({ error: 'An account with this email already exists in the organization' });

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        organizationId: org.id,
        email,
        passwordHash,
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'EMPLOYEE',
      },
    });

    const rawToken = generateToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.emailVerificationToken.create({
      data: { organizationId: org.id, userId: user.id, tokenHash, expiresAt },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyLink = `${frontendUrl}/auth/email-confirmation?token=${rawToken}`;
    const verifyTpl = buildVerifyEmail(org.name, verifyLink);
    await sendMail(user.email, verifyTpl.subject, verifyTpl.html);

    return res.status(201).json({ id: user.id, email: user.email, role: user.role, emailVerificationRequired: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to sign up' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, slug } = req.body as { email: string; password: string; slug: string };
    if (!email || !password || !slug) return res.status(400).json({ error: 'Missing required fields' });

    const org = await prisma.organization.findUnique({ where: { slug } });
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    const user = await prisma.user.findFirst({ where: { organizationId: org.id, email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // Enforce email verification before login
    if (!user.emailVerifiedAt) {
      return res.status(403).json({ error: 'Email not verified. Please check your inbox for the verification link.' });
    }

    const token = signToken({ id: user.id, organizationId: org.id, role: user.role });
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role, organizationId: org.id }, organization: { id: org.id, name: org.name, slug: org.slug, logoUrl: org.logoUrl } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ id: user.id, email: user.email, role: user.role, organizationId: user.organizationId, firstName: user.firstName, lastName: user.lastName });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email, slug } = req.body as { email: string; slug: string };
    if (!email || !slug) return res.status(400).json({ error: 'Missing required fields' });

    const org = await prisma.organization.findUnique({ where: { slug } });
    if (!org) return res.status(200).json({ success: true }); // avoid enumeration

    const user = await prisma.user.findFirst({ where: { organizationId: org.id, email } });

    // Always respond success; only proceed if user exists
    if (user) {
      const rawToken = generateToken(32);
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const link = `${frontendUrl}/auth/reset-password?token=${rawToken}`;
      const emailTpl = buildResetEmail(org.name, link);
      await sendMail(user.email, emailTpl.subject, emailTpl.html);
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ success: true }); // still mask errors
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body as { token: string; password: string };
    if (!token || !password) return res.status(400).json({ error: 'Missing required fields' });

    const tokenHash = hashToken(token);
    const record = await prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) return res.status(400).json({ error: 'Invalid or expired token' });

    const passwordHash = await hashPassword(password);
    await prisma.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });

    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Resend email verification
router.post('/verify-email/resend', async (req: Request, res: Response) => {
  try {
    const { email, slug } = req.body as { email: string; slug: string };
    if (!email || !slug) return res.status(400).json({ error: 'Missing required fields' });

    const org = await prisma.organization.findUnique({ where: { slug } });
    if (!org) return res.status(200).json({ success: true }); // mask

    const user = await prisma.user.findFirst({ where: { organizationId: org.id, email } });
    if (!user) return res.status(200).json({ success: true }); // mask

    // If already verified, simply return success
    if (user.emailVerifiedAt) return res.status(200).json({ success: true });

    const rawToken = generateToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.emailVerificationToken.create({
      data: { organizationId: org.id, userId: user.id, tokenHash, expiresAt },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyLink = `${frontendUrl}/auth/email-confirmation?token=${rawToken}`;
    const verifyTpl = buildVerifyEmail(org.name, verifyLink);
    await sendMail(user.email, verifyTpl.subject, verifyTpl.html);

    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ success: true });
  }
});

// Verify email
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body as { token: string };
    if (!token) return res.status(400).json({ error: 'Missing token' });

    const tokenHash = hashToken(token);
    const rec = await prisma.emailVerificationToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!rec) return res.status(400).json({ error: 'Invalid or expired token' });

    await prisma.user.update({ where: { id: rec.userId }, data: { emailVerifiedAt: new Date() } });
    await prisma.emailVerificationToken.update({ where: { id: rec.id }, data: { usedAt: new Date() } });

    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to verify email' });
  }
});

export default router;