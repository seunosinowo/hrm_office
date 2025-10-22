import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware, rbac } from '../middleware/auth';

const router = Router();

// List assessments (Assessor & HR; employee sees own)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const where = { organizationId: req.user!.organizationId } as any;
    if (req.user!.role === 'EMPLOYEE') {
      where.employeeId = req.user!.id;
    }
    const list = await prisma.assessment.findMany({ where, include: { ratings: true } });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list assessments' });
  }
});

// Create self assessment (employee)
router.post('/self', authMiddleware, rbac(['EMPLOYEE']), async (req: Request, res: Response) => {
  try {
    const created = await prisma.assessment.create({
      data: { organizationId: req.user!.organizationId, type: 'SELF', status: 'PENDING', employeeId: req.user!.id },
    });
    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Create assessor assessment (assessor)
router.post('/assessor', authMiddleware, rbac(['ASSESSOR', 'HR']), async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.body as { employeeId: string };
    const created = await prisma.assessment.create({
      data: { organizationId: req.user!.organizationId, type: 'ASSESSOR', status: 'PENDING', employeeId, assessorId: req.user!.id },
    });
    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Update assessment status
router.put('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED' };
    const a = await prisma.assessment.findUnique({ where: { id } });
    if (!a || a.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'Assessment not found' });
    if (req.user!.role === 'EMPLOYEE' && a.employeeId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });
    
    // Update timestamp based on status
    const updateData: any = { status };
    if (status === 'IN_PROGRESS' && !a.startedAt) {
      updateData.startedAt = new Date();
    }
    if (status === 'COMPLETED' && !a.completedAt) {
      updateData.completedAt = new Date();
    }
    
    const updated = await prisma.assessment.update({ where: { id }, data: updateData });
    
    // When employee completes SELF assessment, automatically create ASSESSOR assessments for ALL assessors
    if (a.type === 'SELF' && status === 'COMPLETED') {
      // Find all assessors in the organization
      const allAssessors = await prisma.user.findMany({
        where: {
          organizationId: a.organizationId,
          role: 'ASSESSOR',
        },
      });
      
      // Create ASSESSOR assessment for each assessor
      for (const assessor of allAssessors) {
        // Check if assessor assessment already exists
        const existingAssessorAssessment = await prisma.assessment.findFirst({
          where: {
            type: 'ASSESSOR',
            employeeId: a.employeeId,
            assessorId: assessor.id,
            organizationId: a.organizationId,
          },
        });
        
        // Only create if doesn't exist
        if (!existingAssessorAssessment) {
          await prisma.assessment.create({
            data: {
              organizationId: a.organizationId,
              type: 'ASSESSOR',
              status: 'PENDING',
              employeeId: a.employeeId,
              assessorId: assessor.id,
            },
          });
        }
      }
    }
    
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Add or update rating for an assessment
router.post('/:id/ratings', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { competencyId, rating, comment } = req.body as { competencyId: string; rating: number; comment?: string };
    const a = await prisma.assessment.findUnique({ where: { id } });
    if (!a || a.organizationId !== req.user!.organizationId) return res.status(404).json({ error: 'Assessment not found' });
    if (req.user!.role === 'EMPLOYEE' && a.employeeId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });
    if (req.user!.role === 'ASSESSOR' && a.assessorId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

    const created = await prisma.assessmentRating.create({
      data: { organizationId: req.user!.organizationId, assessmentId: id, competencyId, rating, comment },
    });
    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to add rating' });
  }
});

export default router;