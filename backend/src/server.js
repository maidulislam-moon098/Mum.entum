import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import onboardingRouter from './routes/onboardingRoutes.js';
import dashboardRouter from './routes/dashboardRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import actionItemsRouter from './routes/actionItemsRoutes.js';
import profileRouter from './routes/profileRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Optionally enable automated notification scheduler
// Uncomment the line below to activate scheduled check-ins
// import './scheduler.js';

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mum.entum-backend' });
});

app.use('/api/onboarding', onboardingRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/chat', chatRouter);
app.use('/api/action-items', actionItemsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/notifications', notificationRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Mum.entum backend running on port ${port}`);
});
