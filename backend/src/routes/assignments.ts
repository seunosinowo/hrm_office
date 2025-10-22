import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware, rbac } from '../middleware/auth';

const router = Router();

// List assessor assignments
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const whereBase: any = { organizationId: req.user!.organizationId };
    // Role-specific filtering
    if (req.user!.role === 'ASSESSOR') {
      whereBase.assessorId = req.user!.id;
    } else if (req.user!.role === 'EMPLOYEE') {
      whereBase.employeeId = req.user!.id;
    }

    const { employeeId, assessorId } = req.query as { employeeId?: string; assessorId?: string };
    const where = {
      ...whereBase,
      ...(employeeId ? { employeeId } : {}),
      ...(assessorId ? { assessorId } : {}),
    };

    const rows = await prisma.assessorAssignment.findMany({
      where,
      include: {
        assessor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        employee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list assignments' });
  }
});

// Create assignment (HR only)
router.post('/', authMiddleware, rbac(['HR']), async (req: Request, res: Response) => {
  try {
    const { assessorId, employeeId } = req.body as { assessorId: string; employeeId: string };
    if (!assessorId || !employeeId) return res.status(400).json({ error: 'assessorId and employeeId are required' });

    const [assessor, employee] = await Promise.all([
      prisma.user.findUnique({ where: { id: assessorId } }),
      prisma.user.findUnique({ where: { id: employeeId } }),
    ]);
    if (!assessor || !employee) return res.status(404).json({ error: 'User not found' });
    if (assessor.organizationId !== req.user!.organizationId || employee.organizationId !== req.user!.organizationId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Optional validation: ensure assessor has ASSESSOR role and employee has EMPLOYEE role
    if (assessor.role !== 'ASSESSOR') return res.status(400).json({ error: 'Selected user is not an assessor' });
    if (employee.role !== 'EMPLOYEE') return res.status(400).json({ error: 'Selected user is not an employee' });

    try {
      const created = await prisma.assessorAssignment.create({
        data: {
          organizationId: req.user!.organizationId,
          assessorId,
          employeeId,
        },
      });
      res.json(created);
    } catch (err: any) {
      if (err?.code === 'P2002') {
        return res.status(409).json({ error: 'Assignment already exists for assessor and employee' });
      }
      throw err;
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// Update assignment (HR only)
router.put('/:id', authMiddleware, rbac(['HR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assessorId, employeeId } = req.body as { assessorId?: string; employeeId?: string };

    const existing = await prisma.assessorAssignment.findUnique({ where: { id } });
    if (!existing || existing.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'Assignment not found' });

    // Optional: validate new ids belong to org
    if (assessorId) {
      const assessor = await prisma.user.findUnique({ where: { id: assessorId } });
      if (!assessor || assessor.organizationId !== req.user!.organizationId) return res.status(400).json({ error: 'Invalid assessor' });
    }
    if (employeeId) {
      const employee = await prisma.user.findUnique({ where: { id: employeeId } });
      if (!employee || employee.organizationId !== req.user!.organizationId) return res.status(400).json({ error: 'Invalid employee' });
    }

    const updated = await prisma.assessorAssignment.update({
      where: { id },
      data: { assessorId, employeeId },
    });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// Delete assignment (HR only)
router.delete('/:id', authMiddleware, rbac(['HR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.assessorAssignment.findUnique({ where: { id } });
    if (!existing || existing.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'Assignment not found' });
    await prisma.assessorAssignment.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

export default router;