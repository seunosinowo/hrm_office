import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware, rbac } from '../middleware/auth';

const router = Router();

// List job assignments
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const whereBase: any = { organizationId: req.user!.organizationId };
    // Role-specific filtering
    if (req.user!.role === 'EMPLOYEE') {
      whereBase.employeeId = req.user!.id;
    }

    const { employeeId, jobId } = req.query as { employeeId?: string; jobId?: string };
    const where = {
      ...whereBase,
      ...(employeeId ? { employeeId } : {}),
      ...(jobId ? { jobId } : {}),
    };

    const rows = await prisma.employeeJobAssignment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { job: { include: { department: true } }, employee: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list job assignments' });
  }
});

// Create job assignment (HR only)
router.post('/', authMiddleware, rbac(['HR']), async (req: Request, res: Response) => {
  try {
    const { employeeId, jobId, startDate } = req.body as { employeeId: string; jobId: string; startDate?: string };
    if (!employeeId || !jobId) return res.status(400).json({ error: 'employeeId and jobId are required' });

    const [employee, job] = await Promise.all([
      prisma.user.findUnique({ where: { id: employeeId } }),
      prisma.job.findUnique({ where: { id: jobId } }),
    ]);
    if (!employee || !job) return res.status(404).json({ error: 'Employee or Job not found' });
    if (employee.organizationId !== req.user!.organizationId || job.organizationId !== req.user!.organizationId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const created = await prisma.employeeJobAssignment.create({
      data: {
        organizationId: req.user!.organizationId,
        employeeId,
        jobId,
        startDate: startDate ? new Date(startDate) : undefined,
      },
      include: { job: { include: { department: true } } },
    });
    res.json(created);
  } catch (e) {
    console.error(e);
    if ((e as any)?.code === 'P2002') {
      return res.status(409).json({ error: 'Assignment already exists for employee and job' });
    }
    res.status(500).json({ error: 'Failed to create job assignment' });
  }
});

// Update job assignment (HR only)
router.put('/:id', authMiddleware, rbac(['HR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { employeeId, jobId, startDate } = req.body as { employeeId?: string; jobId?: string; startDate?: string };

    const existing = await prisma.employeeJobAssignment.findUnique({ where: { id } });
    if (!existing || existing.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'Job assignment not found' });

    // Optional validations for org membership
    if (employeeId) {
      const employee = await prisma.user.findUnique({ where: { id: employeeId } });
      if (!employee || employee.organizationId !== req.user!.organizationId) return res.status(400).json({ error: 'Invalid employee' });
    }
    if (jobId) {
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job || job.organizationId !== req.user!.organizationId) return res.status(400).json({ error: 'Invalid job' });
    }

    const updated = await prisma.employeeJobAssignment.update({
      where: { id },
      data: {
        employeeId,
        jobId,
        startDate: startDate ? new Date(startDate) : undefined,
      },
      include: { job: { include: { department: true } } },
    });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update job assignment' });
  }
});

// Delete job assignment (HR only)
router.delete('/:id', authMiddleware, rbac(['HR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.employeeJobAssignment.findUnique({ where: { id } });
    if (!existing || existing.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'Job assignment not found' });
    await prisma.employeeJobAssignment.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete job assignment' });
  }
});

export default router;