import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import rolesRouter from './routes/roles';
import orgRouter from './routes/organizations';
import depRouter from './routes/departments';
import jobsRouter from './routes/jobs';
import compRouter from './routes/competencies';
import assessRouter from './routes/assessments';
import analyticsRouter from './routes/analytics';
import uploadsRouter from './routes/uploads';
import assignmentsRouter from './routes/assignments';
import jobAssignmentsRouter from './routes/employeeJobAssignments';
import employeesRouter from './routes/employees';
import appraisalsRouter from './routes/appraisals';
import { getTransporter } from './utils/email';

dotenv.config();

const app = express();

app.use(express.json());

// Explicit CORS headers for all routes (preflight and actual)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  const reqAllowHeaders = (req.headers['access-control-request-headers'] as string) || 'Content-Type, Authorization';
  res.header('Access-Control-Allow-Headers', reqAllowHeaders);
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// CORS: allow all URLs, headers, and methods
// This is intentionally permissive to avoid remote login/signup hanging
// due to blocked preflight or origin checks.
const corsOptions: cors.CorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'hrmoffice-backend' });
});

// SMTP health verification
app.get('/health/smtp', async (_req: Request, res: Response) => {
  try {
    const tx = getTransporter();
    if (!tx) return res.json({ configured: false, verified: false, message: 'SMTP env not fully configured' });
    await tx.verify();
    return res.json({ configured: true, verified: true });
  } catch (e: any) {
    return res.json({ configured: true, verified: false, error: String(e?.message || e) });
  }
});

// Root route - useful for Render/Vercel probes and quick checks
app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'HRM Office API', base: '/api' });
});

// Routes will be mounted here
app.use('/api/auth', authRouter);
app.use('/api/organizations', orgRouter);
app.use('/api/users', usersRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/departments', depRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/competencies', compRouter);
app.use('/api/assessments', assessRouter);
app.use('/api/appraisals', appraisalsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/job-assignments', jobAssignmentsRouter);
app.use('/api/employees', employeesRouter);

export default app;