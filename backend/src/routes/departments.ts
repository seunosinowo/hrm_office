import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware, rbac } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({ where: { organizationId: req.user!.organizationId } });
    res.json(departments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list departments' });
  }
});

router.post('/', authMiddleware, rbac(['HR']), async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name: string };
    const dep = await prisma.department.create({ data: { organizationId: req.user!.organizationId, name } });
    res.status(201).json(dep);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

router.put('/:id', authMiddleware, rbac(['HR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body as { name?: string };
    const dep = await prisma.department.update({ where: { id }, data: { name } });
    if (dep.organizationId !== req.user!.organizationId) return res.status(403).json({ error: 'Forbidden' });
    res.json(dep);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update department' });
  }
});

router.delete('/:id', authMiddleware, rbac(['HR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dep = await prisma.department.findUnique({ where: { id } });
    if (!dep || dep.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'Department not found' });
    await prisma.department.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

export default router;