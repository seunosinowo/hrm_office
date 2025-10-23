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

dotenv.config();

const app = express();

app.use(express.json());

// Enhanced CORS: allow multiple origins from env, handle preflight explicitly
const originSetting = process.env.CORS_ORIGIN || '*';
const allowedOrigins = originSetting.split(',').map(s => s.trim()).filter(Boolean);
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // non-browser or same-origin
    if (originSetting === '*') return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'hrmoffice-backend' });
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