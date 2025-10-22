import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware, rbac } from '../middleware/auth';

const router = Router();

// List users in org (HR & Assessor)
router.get('/', authMiddleware, rbac(['HR', 'ASSESSOR']), async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { organizationId: req.user!.organizationId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
      orderBy: { firstName: 'asc' },
    });
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// Get user by id (HR & Assessor & employee self)
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'User not found' });
    if (req.user!.role === 'EMPLOYEE' && req.user!.id !== id) return res.status(403).json({ error: 'Forbidden' });
    res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, phone: user.phone || null, profilePictureUrl: user.profilePictureUrl || null, isLockedUntil: user.isLockedUntil || null, onboardingCompleted: !!user.onboardingCompleted });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user (HR only; employee can update own limited fields with 12-hour lock)
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, profilePictureUrl } = req.body as { firstName?: string; lastName?: string; phone?: string; profilePictureUrl?: string };
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'User not found' });

    if (req.user!.role === 'HR') {
      const updated = await prisma.user.update({ where: { id }, data: { firstName, lastName, phone, profilePictureUrl } });
      return res.json({ id: updated.id });
    }

    if (req.user!.role === 'EMPLOYEE') {
      if (req.user!.id !== id) return res.status(403).json({ error: 'Forbidden' });
      const now = new Date();
      // If onboarding not completed, allow update without lock
      if (!user.onboardingCompleted) {
        const updated = await prisma.user.update({ where: { id }, data: { firstName, lastName, phone, profilePictureUrl } });
        return res.json({ id: updated.id });
      }
      // After onboarding, enforce 12-hour lock window
      if (user.isLockedUntil && user.isLockedUntil > now) {
        return res.status(423).json({ error: 'Profile locked. Try later.' });
      }
      const updated = await prisma.user.update({
        where: { id },
        data: {
          firstName,
          lastName,
          phone,
          profilePictureUrl,
          isLockedUntil: new Date(Date.now() + 12 * 60 * 60 * 1000),
        },
      });
      return res.json({ id: updated.id });
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (HR only)
router.delete('/:id', authMiddleware, rbac(['HR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'User not found' });
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;