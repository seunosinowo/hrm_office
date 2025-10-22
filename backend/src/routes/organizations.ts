import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware, rbac } from '../middleware/auth';

const router = Router();

// Public list of organizations for login dropdown
router.get('/public', async (_req: Request, res: Response) => {
  try {
    const orgs = await prisma.organization.findMany({
      select: { id: true, name: true, slug: true, logoUrl: true },
      orderBy: { name: 'asc' },
    });
    res.json(orgs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list organizations' });
  }
});

// Get my organization info (HR & Assessor & Employee)
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const org = await prisma.organization.findUnique({ where: { id: req.user!.organizationId } });
    if (!org) return res.status(404).json({ error: 'Organization not found' });
    res.json({ id: org.id, name: org.name, slug: org.slug, email: org.email, logoUrl: org.logoUrl, address: org.address });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

// Update organization settings (HR only)
router.put('/me', authMiddleware, rbac(['HR']), async (req: Request, res: Response) => {
  try {
    const { name, email, logoUrl, address } = req.body as { name?: string; email?: string; logoUrl?: string; address?: string };
    const org = await prisma.organization.update({
      where: { id: req.user!.organizationId },
      data: { name, email, logoUrl, address },
    });
    res.json({ id: org.id, name: org.name, slug: org.slug, email: org.email, logoUrl: org.logoUrl, address: org.address });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

export default router;