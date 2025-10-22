import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware, rbac } from '../middleware/auth';

const router = Router();

// Update a user's role (HR only)
router.put('/:id', authMiddleware, rbac(['HR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body as { role: 'EMPLOYEE' | 'ASSESSOR' | 'HR' };
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'User not found' });
    const updated = await prisma.user.update({ where: { id }, data: { role } });
    res.json({ id: updated.id, role: updated.role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

export default router;