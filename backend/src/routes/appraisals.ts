import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware, rbac } from '../middleware/auth';

const router = Router();

async function ensureDefaultQuestions(organizationId: string) {
  const count = await prisma.performanceAppraisalQuestion.count({ where: { organizationId } });
  if (count > 0) return;

  const questions = [
    {
      title: 'COMPETENCY MATCH',
      howToMeasure: 'Job analysis vs. resume and actual duties',
      goodIndicator: 'Good Indicator: Job matches skills and qualifications',
      redFlag: 'Red Flag: Mismatch between tasks and core skills',
      ratingCriteria: '5 = Full match, 3 = Partial, 1 = Misaligned'
    },
    {
      title: 'ALIGNED KPIs',
      howToMeasure: 'KPI documentation alignment with JD',
      goodIndicator: 'Good Indicator: KPIs directly reflect job duties',
      redFlag: 'Red Flag: Irrelevant or misaligned KPIs',
      ratingCriteria: '5 = Full match, 3 = Partial, 1 = Misaligned'
    },
    {
      title: 'ROLE UNDERSTANDING',
      howToMeasure: 'Supervision required, task completion logs',
      goodIndicator: 'Good Indicator: Executes with autonomy',
      redFlag: 'Red Flag: Constant need for supervision',
      ratingCriteria: '5 = Independent, 3 = Moderate guidance, 1 = Frequent hand-holding'
    },
    {
      title: 'SUPERVISOR FEEDBACK',
      howToMeasure: 'Quarterly feedback score',
      goodIndicator: 'Good Indicator: Consistently positive evaluations',
      redFlag: 'Red Flag: Supervisor flags gaps repeatedly',
      ratingCriteria: '5 = Consistently positive, 3 = Mixed, 1 = Poor'
    },
    {
      title: 'EXPECTATION MATCH',
      howToMeasure: 'Number of escalations for clarity',
      goodIndicator: 'Good Indicator: Minimal clarification needed',
      redFlag: 'Red Flag: Often confused about expectations',
      ratingCriteria: '5 = Rarely, 3 = Occasionally, 1 = Frequently'
    },
    {
      title: 'STRENGTH UTILIZATION',
      howToMeasure: '% of tasks in strength zone',
      goodIndicator: 'Good Indicator: Uses core strengths frequently',
      redFlag: 'Red Flag: Working outside comfort zone often',
      ratingCriteria: '5 = >80%, 3 = 50–79%, 1 = <50%'
    },
    {
      title: 'HIRING PURPOSE ALIGNMENT',
      howToMeasure: 'Role change audit vs. original offer',
      goodIndicator: 'Good Indicator: Still aligned with hiring goals',
      redFlag: 'Red Flag: Role drift without review or fit',
      ratingCriteria: '5 = Consistent, 3 = Some shift, 1 = Major drift'
    },
    {
      title: 'REDEPLOYMENT UNNECESSARY',
      howToMeasure: 'Redeployment request frequency',
      goodIndicator: 'Good Indicator: Well-placed and stable',
      redFlag: 'Red Flag: Redeployment actively considered',
      ratingCriteria: '5 = Never, 3 = Discussed, 1 = Recommended'
    },
    {
      title: 'ONGOING LEARNING',
      howToMeasure: '#No of completed role-relevant courses',
      goodIndicator: 'Good Indicator: Recent relevant training',
      redFlag: 'Red Flag: No learning undertaken recently',
      ratingCriteria: '5 = ≥2, 3 = 1, 1 = None'
    },
    {
      title: 'ERROR RATE',
      howToMeasure: '% of deliverables needing rework',
      goodIndicator: 'Good Indicator: Low correction/rework levels',
      redFlag: 'Red Flag: Frequent errors or rework',
      ratingCriteria: '5 = <10%, 3 = 10–20%, 1 = >20%'
    },
    {
      title: 'TIMELINES',
      howToMeasure: '% of tasks delivered on or before due date',
      goodIndicator: 'Good Indicator: Consistently meets deadlines',
      redFlag: 'Red Flag: Regular delays or deadline extensions',
      ratingCriteria: '5 = ≥95%, 3 = 80–94%, 1 = <80%'
    },
    {
      title: 'TOOL UTILIZATION',
      howToMeasure: 'Tech/tool usage rate',
      goodIndicator: 'Good Indicator: Uses tools to optimize work',
      redFlag: 'Red Flag: Resists adopting helpful technologies',
      ratingCriteria: '5 = High usage, 3 = Moderate, 1 = Avoids tools'
    },
    {
      title: 'PROCESS OPTIMIZATION',
      howToMeasure: '#No of suggestions implemented',
      goodIndicator: 'Good Indicator: Improves or streamlines work',
      redFlag: 'Red Flag: Makes no process improvement effort',
      ratingCriteria: '5 = ≥3/quarter, 3 = 1–2, 1 = None'
    },
    {
      title: 'CONTINUOUS IMPROVEMENT',
      howToMeasure: 'Courses/programs in 6 months',
      goodIndicator: 'Good Indicator: Participates in learning initiatives',
      redFlag: 'Red Flag: No recent development participation',
      ratingCriteria: '5 = ≥2, 3 = 1, 1 = None'
    },
    {
      title: 'TIME MANAGEMENT',
      howToMeasure: 'Idle time report',
      goodIndicator: 'Good Indicator: High productivity per time',
      redFlag: 'Red Flag: Extended idle periods or poor focus',
      ratingCriteria: '5 = <10%, 3 = 10–20%, 1 = >20%'
    },
    {
      title: 'MINIMAL REWORK',
      howToMeasure: 'Supervisor corrections per task',
      goodIndicator: 'Good Indicator: Work needs no revisions',
      redFlag: 'Red Flag: Work often requires corrections',
      ratingCriteria: '5 = Rarely, 3 = Sometimes, 1 = Frequently'
    },
    {
      title: 'FLEXIBILITY',
      howToMeasure: 'Response time to change',
      goodIndicator: 'Good Indicator: Adapts well to change',
      redFlag: 'Red Flag: Struggles with unexpected change',
      ratingCriteria: '5 = Immediate, 3 = Delayed, 1 = Resists'
    },
    {
      title: 'URGENCY AWARENESS',
      howToMeasure: 'Time-sensitive task success rate',
      goodIndicator: 'Good Indicator: Responds with urgency as needed',
      redFlag: 'Red Flag: Delays critical responses or actions',
      ratingCriteria: '5 = Always meets, 3 = Mixed, 1 = Misses'
    },
    {
      title: 'PRODUCTIVITY',
      howToMeasure: 'Output vs. time spent',
      goodIndicator: 'Good Indicator: High output with efficient time use',
      redFlag: 'Red Flag: Low output despite time spent',
      ratingCriteria: '5 = Excellent, 4 = Good, 3 = Average, 2 = Below Average, 1 = Poor'
    },
    {
      title: 'PROFIT IMPACT',
      howToMeasure: 'Contribution to revenue/cost savings',
      goodIndicator: 'Good Indicator: Positive impact on profitability',
      redFlag: 'Red Flag: Negative or no impact on profitability',
      ratingCriteria: '5 = Excellent, 4 = Good, 3 = Average, 2 = Below Average, 1 = Poor'
    }
  ];

  // Use createMany with skipDuplicates to avoid unique constraint failures
  const dataToCreate = questions.map((q, idx) => ({
    organizationId,
    key: q.title.toLowerCase().replace(/\s+/g, '_'),
    title: q.title,
    howToMeasure: q.howToMeasure,
    goodIndicator: q.goodIndicator,
    redFlag: q.redFlag,
    ratingCriteria: q.ratingCriteria,
    order: idx + 1
  }));

  await prisma.performanceAppraisalQuestion.createMany({
    data: dataToCreate,
    skipDuplicates: true
  });
}

// List appraisals
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const where: any = { organizationId: req.user!.organizationId };
    
    if (req.user!.role === 'EMPLOYEE') {
      where.employeeId = req.user!.id;
    } else if (req.user!.role === 'ASSESSOR') {
      const assignments = await prisma.assessorAssignment.findMany({
        where: { 
          organizationId: req.user!.organizationId, 
          assessorId: req.user!.id 
        },
      });
      const employeeIds = assignments.map(a => a.employeeId);
      where.employeeId = { in: employeeIds };
    }
    
    const list = await prisma.performanceAppraisal.findMany({ 
      where, 
      include: { 
        employee: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        assessor: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list appraisals' });
  }
});

// Get questions
router.get('/questions', authMiddleware, async (req: Request, res: Response) => {
  try {
    await ensureDefaultQuestions(req.user!.organizationId);
    
    const questions = await prisma.performanceAppraisalQuestion.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: { order: 'asc' },
    });
    
    res.json(questions);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Create self appraisal
router.post('/self', authMiddleware, rbac(['EMPLOYEE']), async (req: Request, res: Response) => {
  try {
    const created = await prisma.performanceAppraisal.create({
      data: { 
        organizationId: req.user!.organizationId, 
        type: 'SELF', 
        status: 'PENDING', 
        employeeId: req.user!.id 
      },
    });
    
    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create appraisal' });
  }
});

// Create assessor appraisal
router.post('/assessor', authMiddleware, rbac(['ASSESSOR', 'HR']), async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.body as { employeeId: string };
    
    const created = await prisma.performanceAppraisal.create({
      data: { 
        organizationId: req.user!.organizationId, 
        type: 'ASSESSOR', 
        status: 'PENDING', 
        employeeId, 
        assessorId: req.user!.id 
      },
    });
    
    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create assessor appraisal' });
  }
});

// Update status
router.put('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED' };
    
    const appraisal = await prisma.performanceAppraisal.findUnique({ where: { id } });
    if (!appraisal || appraisal.organizationId !== req.user!.organizationId) {
      return res.status(404).json({ error: 'Appraisal not found' });
    }
    
    if (req.user!.role === 'EMPLOYEE' && appraisal.employeeId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.user!.role === 'ASSESSOR') {
      // If it's a SELF appraisal, allow assessors who are assigned to this employee to view responses
      if (appraisal.type === 'SELF') {
        const assignment = await prisma.assessorAssignment.findFirst({
          where: {
            organizationId: req.user!.organizationId,
            assessorId: req.user!.id,
            employeeId: appraisal.employeeId
          }
        });

        if (!assignment) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      } else {
        // For ASSESSOR appraisals, only the assigned assessor can view
        if (appraisal.assessorId !== req.user!.id) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
    }

    const updateData: any = { status };
    if (status === 'IN_PROGRESS' && !appraisal.startedAt) {
      updateData.startedAt = new Date();
    }
    
    if (status === 'COMPLETED' && !appraisal.completedAt) {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.performanceAppraisal.update({ 
      where: { id }, 
      data: updateData 
    });

    // When employee completes SELF appraisal, create ASSESSOR appraisals
    if (appraisal.type === 'SELF' && status === 'COMPLETED') {
      const assignments = await prisma.assessorAssignment.findMany({
        where: { 
          organizationId: appraisal.organizationId, 
          employeeId: appraisal.employeeId 
        },
      });
      
      for (const assign of assignments) {
        const existing = await prisma.performanceAppraisal.findFirst({
          where: { 
            organizationId: appraisal.organizationId, 
            type: 'ASSESSOR', 
            employeeId: appraisal.employeeId, 
            assessorId: assign.assessorId 
          },
        });
        
        if (!existing) {
          await prisma.performanceAppraisal.create({
            data: { 
              organizationId: appraisal.organizationId, 
              type: 'ASSESSOR', 
              status: 'PENDING', 
              employeeId: appraisal.employeeId, 
              assessorId: assign.assessorId 
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

// Save response
router.post('/:id/responses', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { questionId, rating, comment } = req.body as { 
      questionId: string; 
      rating: number; 
      comment?: string 
    };
    
    const appraisal = await prisma.performanceAppraisal.findUnique({ where: { id } });
    if (!appraisal || appraisal.organizationId !== req.user!.organizationId) {
      return res.status(404).json({ error: 'Appraisal not found' });
    }
    
    if (req.user!.role === 'EMPLOYEE' && appraisal.employeeId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    if (req.user!.role === 'ASSESSOR' && appraisal.assessorId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const existing = await prisma.performanceAppraisalResponse.findUnique({
      where: { 
        appraisalId_questionId: { 
          appraisalId: id, 
          questionId 
        } as any 
      },
    });

    let updated;
    if (!existing) {
      updated = await prisma.performanceAppraisalResponse.create({
        data: {
          organizationId: req.user!.organizationId,
          appraisalId: id,
          questionId,
          employeeRating: req.user!.role === 'EMPLOYEE' ? rating : null,
          employeeComment: req.user!.role === 'EMPLOYEE' ? comment || null : null,
          assessorRating: req.user!.role === 'ASSESSOR' ? rating : null,
          assessorComment: req.user!.role === 'ASSESSOR' ? comment || null : null,
        },
      });
    } else {
      const data: any = {};
      if (req.user!.role === 'EMPLOYEE') { 
        data.employeeRating = rating; 
        data.employeeComment = comment || null; 
      }
      
      if (req.user!.role === 'ASSESSOR') { 
        data.assessorRating = rating; 
        data.assessorComment = comment || null; 
      }
      
      updated = await prisma.performanceAppraisalResponse.update({ 
        where: { id: existing.id }, 
        data 
      });
    }

    res.status(existing ? 200 : 201).json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to save response' });
  }
});

// Get responses
router.get('/:id/responses', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const appraisal = await prisma.performanceAppraisal.findUnique({ where: { id } });
    if (!appraisal || appraisal.organizationId !== req.user!.organizationId) {
      return res.status(404).json({ error: 'Appraisal not found' });
    }
    
    if (req.user!.role === 'EMPLOYEE' && appraisal.employeeId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    if (req.user!.role === 'ASSESSOR' && appraisal.assessorId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const responses = await prisma.performanceAppraisalResponse.findMany({ 
      where: { appraisalId: id },
      include: { question: true }
    });
    
    res.json(responses);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

export default router;