import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware, rbac } from '../middleware/auth';

const router = Router();

// List jobs (all roles) scoped to organization
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { organizationId: req.user!.organizationId },
      include: { department: true, requirements: true },
    });
    res.json(jobs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list jobs' });
  }
});

// Create job (HR & Assessor)
router.post('/', authMiddleware, rbac(['HR', 'ASSESSOR']), async (req: Request, res: Response) => {
  try {
    const { title, description, departmentId } = req.body as { title: string; description?: string; departmentId?: string };
    const job = await prisma.job.create({
      data: { organizationId: req.user!.organizationId, title, description, departmentId },
    });
    res.status(201).json(job);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update job (HR & Assessor) with org scoping
router.put('/:id', authMiddleware, rbac(['HR', 'ASSESSOR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, departmentId } = req.body as { title?: string; description?: string; departmentId?: string };

    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Job not found' });
    if (existing.organizationId !== req.user!.organizationId) return res.status(403).json({ error: 'Forbidden' });

    const job = await prisma.job.update({ where: { id }, data: { title, description, departmentId } });
    res.json(job);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job (HR & Assessor) with org scoping
router.delete('/:id', authMiddleware, rbac(['HR', 'ASSESSOR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job || job.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'Job not found' });

    // Remove dependent rows first to avoid FK constraint errors
    await prisma.$transaction([
      prisma.employeeJobAssignment.deleteMany({ where: { organizationId: req.user!.organizationId, jobId: id } }),
      prisma.jobCompetency.deleteMany({ where: { organizationId: req.user!.organizationId, jobId: id } }),
      prisma.job.delete({ where: { id } }),
    ]);

    res.json({ success: true });
  } catch (e: any) {
    console.error(e);
    // Bubble up clearer message when FK constraints block deletion
    return res.status(500).json({ error: e?.message || 'Failed to delete job' });
  }
});

// Add job competency requirement (HR & Assessor)
router.post('/:id/requirements', authMiddleware, rbac(['HR', 'ASSESSOR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { competencyId, requiredLevel } = req.body as { competencyId: string; requiredLevel: number };
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job || job.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'Job not found' });

    // Validate competency belongs to same org
    const comp = await prisma.competency.findUnique({ where: { id: competencyId } });
    if (!comp || comp.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'Competency not found' });

    const jc = await prisma.jobCompetency.create({
      data: { organizationId: req.user!.organizationId, jobId: id, competencyId, requiredLevel },
    });
    res.status(201).json(jc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to add requirement' });
  }
});

// Update job competency requirement (HR & Assessor)
router.put('/:id/requirements/:reqId', authMiddleware, rbac(['HR', 'ASSESSOR']), async (req: Request, res: Response) => {
  try {
    const { id, reqId } = req.params;
    const { competencyId, requiredLevel } = req.body as { competencyId?: string; requiredLevel?: number };

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job || job.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'Job not found' });

    const existingReq = await prisma.jobCompetency.findUnique({ where: { id: reqId } });
    if (!existingReq || existingReq.organizationId !== req.user!.organizationId || existingReq.jobId !== id) {
      return res.status(404).json({ error: 'Requirement not found' });
    }

    const updateData: any = {};
    if (typeof requiredLevel === 'number') updateData.requiredLevel = requiredLevel;

    if (competencyId) {
      const comp = await prisma.competency.findUnique({ where: { id: competencyId } });
      if (!comp || comp.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'Competency not found' });
      updateData.competencyId = competencyId;
    }

    const updated = await prisma.jobCompetency.update({ where: { id: reqId }, data: updateData });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update requirement' });
  }
});

// Delete job competency requirement (HR & Assessor)
router.delete('/:id/requirements/:reqId', authMiddleware, rbac(['HR', 'ASSESSOR']), async (req: Request, res: Response) => {
  try {
    const { id, reqId } = req.params;
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job || job.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'Job not found' });

    const existingReq = await prisma.jobCompetency.findUnique({ where: { id: reqId } });
    if (!existingReq || existingReq.organizationId !== req.user!.organizationId || existingReq.jobId !== id) {
      return res.status(404).json({ error: 'Requirement not found' });
    }

    await prisma.jobCompetency.delete({ where: { id: reqId } });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete requirement' });
  }
});

export default router;