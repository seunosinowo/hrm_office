import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Simple gap analysis: compares job required levels with latest assessment ratings
router.get('/gap/:employeeId/:jobId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { employeeId, jobId } = req.params;
    if (req.user!.role === 'EMPLOYEE' && req.user!.id !== employeeId) return res.status(403).json({ error: 'Forbidden' });

    const jobReqs = await prisma.jobCompetency.findMany({
      where: { organizationId: req.user!.organizationId, jobId },
      include: { competency: true },
    });

    const latestAssessment = await prisma.assessment.findFirst({
      where: { organizationId: req.user!.organizationId, employeeId },
      orderBy: { createdAt: 'desc' },
    });

    const ratings = latestAssessment
      ? await prisma.assessmentRating.findMany({ where: { organizationId: req.user!.organizationId, assessmentId: latestAssessment.id } })
      : [];

    // Build gap report
    const report = jobReqs.map(reqItem => {
      const rating = ratings.find(r => r.competencyId === reqItem.competencyId)?.rating ?? 0;
      const gap = reqItem.requiredLevel - rating;
      return {
        competencyId: reqItem.competencyId,
        competencyName: reqItem.competency.name,
        requiredLevel: reqItem.requiredLevel,
        currentLevel: rating,
        gap,
      };
    });

    res.json({ employeeId, jobId, items: report });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to compute gap analysis' });
  }
});

export default router;