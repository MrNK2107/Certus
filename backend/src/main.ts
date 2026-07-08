import express from 'express';
import cors from 'cors';
import { requestIdMiddleware, responseEnvelopeMiddleware, errorHandlerMiddleware } from './middleware';

import publicRouter from './modules/public/public-router';
import casesRouter from './modules/cases/cases-router';
import consentsRouter from './modules/consents/consents-router';
import sourcesRouter from './modules/sources/sources-router';
import scoringRouter from './modules/scoring/scoring-router';
import decisionsRouter from './modules/decisions/decisions-router';
import auditRouter from './modules/audit/audit-router';
import governanceRouter from './modules/governance/governance-router';
import opsRouter from './modules/ops/ops-router';
import adminRouter from './modules/admin/admin-router';
import notesRouter from './modules/notes/notes-router';
import dashboardRouter from './modules/dashboard/dashboard-router';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(responseEnvelopeMiddleware);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/public`, publicRouter);
app.use(`${API_PREFIX}/cases`, casesRouter);
app.use(`${API_PREFIX}/consents`, consentsRouter);
app.use(`${API_PREFIX}/sources`, sourcesRouter);
app.use(`${API_PREFIX}/scores`, scoringRouter);
app.use(`${API_PREFIX}/decisions`, decisionsRouter);
app.use(`${API_PREFIX}/audit`, auditRouter);
app.use(`${API_PREFIX}/governance`, governanceRouter);
app.use(`${API_PREFIX}/ops`, opsRouter);
app.use(`${API_PREFIX}/admin`, adminRouter);
app.use(`${API_PREFIX}/notes`, notesRouter);
app.use(`${API_PREFIX}/dashboard`, dashboardRouter);

app.use(errorHandlerMiddleware);

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}
