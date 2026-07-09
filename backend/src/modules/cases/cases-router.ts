import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Case, CaseState, AuditActionType, FilterParams, PaginationParams } from '@msme-credit/shared';
import { caseStore } from './case-store';
import { caseStateMachine } from './case-state-machine';
import { auditStore } from '../audit/audit-store';
import { wrapAsync, AppError } from '../../middleware';

const router = Router();

router.get('/', wrapAsync(async (req: Request, res: Response) => {
  const filters: FilterParams = {
    status: req.query.status as string | undefined,
    sector: req.query.sector as string | undefined,
    searchTerm: req.query.searchTerm as string | undefined,
    dateFrom: req.query.dateFrom as string | undefined,
    dateTo: req.query.dateTo as string | undefined,
  };
  const pagination: PaginationParams = {
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20,
    sortBy: req.query.sortBy as string | undefined,
    sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
  };

  const { cases, total } = caseStore.findAll(
    Object.values(filters).some(v => v !== undefined) ? filters : undefined,
    pagination
  );

  const page = pagination.page || 1;
  const pageSize = pagination.pageSize || 20;
  res.json({
    data: cases,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  });
}));

router.post('/', wrapAsync(async (req: Request, res: Response) => {
  const body = req.body as Partial<Case>;
  const now = new Date().toISOString();
  const caseData: Case = {
    caseId: `CASE-${uuidv4().substring(0, 8)}`,
    applicantId: body.applicantId || uuidv4(),
    businessName: body.businessName || '',
    sector: body.sector || 'OTHER' as any,
    status: CaseState.DRAFT,
    createdAt: now,
    updatedAt: now,
    modelVersion: body.modelVersion || '1.0.0',
    policyVersion: body.policyVersion || '1.2',
    ownerTeam: body.ownerTeam,
    ownerUser: body.ownerUser,
    businessProfile: body.businessProfile,
  };

  if (!caseData.businessName) {
    throw new AppError(400, 'VALIDATION_ERROR', 'businessName is required');
  }

  const created = caseStore.create(caseData);

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    caseId: created.caseId,
    actor: req.headers['x-user'] as string || 'System',
    action: AuditActionType.CASE_CREATED,
    objectType: 'Case',
    objectId: created.caseId,
    timestamp: now,
    requestId: req.requestId,
    versionContext: { modelVersion: created.modelVersion, policyVersion: created.policyVersion },
  });

  res.status(201).json(created);
}));

router.get('/:caseId', wrapAsync(async (req: Request, res: Response) => {
  const caseData = caseStore.findById(req.params.caseId);
  if (!caseData) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');
  res.json(caseData);
}));

router.patch('/:caseId', wrapAsync(async (req: Request, res: Response) => {
  const existing = caseStore.findById(req.params.caseId);
  if (!existing) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');

  const updated = caseStore.update(req.params.caseId, req.body);
  res.json(updated);
}));

router.delete('/:caseId', wrapAsync(async (req: Request, res: Response) => {
  const caseData = caseStore.findById(req.params.caseId);
  if (!caseData) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');
  if (caseData.status !== CaseState.DRAFT) {
    throw new AppError(400, 'CANNOT_DELETE', 'Only draft cases can be deleted');
  }
  caseStore.delete(req.params.caseId);
  res.status(204).send();
}));

router.post('/:caseId/transition', wrapAsync(async (req: Request, res: Response) => {
  const { toState } = req.body as { toState: CaseState };
  if (!toState) throw new AppError(400, 'VALIDATION_ERROR', 'toState is required');

  const caseData = caseStore.findById(req.params.caseId);
  if (!caseData) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');

  if (caseStateMachine.isTerminal(caseData.status)) {
    throw new AppError(400, 'TERMINAL_STATE', 'Cannot transition from a terminal state');
  }

  const newState = caseStateMachine.transition(caseData.status, toState);
  const updated = caseStore.update(req.params.caseId, { status: newState });

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    caseId: updated.caseId,
    actor: req.headers['x-user'] as string || 'System',
    action: AuditActionType.CASE_STATE_CHANGED,
    objectType: 'Case',
    objectId: updated.caseId,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    beforeState: { status: caseData.status },
    afterState: { status: newState },
    versionContext: {},
  });

  res.json(updated);
}));

router.get('/:caseId/summary', wrapAsync(async (req: Request, res: Response) => {
  const summary = caseStore.getSummary(req.params.caseId);
  if (!summary) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');
  res.json(summary);
}));

router.get('/:caseId/timeline', wrapAsync(async (req: Request, res: Response) => {
  const caseData = caseStore.findById(req.params.caseId);
  if (!caseData) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');

  const events = auditStore.findByCase(req.params.caseId);
  res.json(events);
}));

// Pipeline Simulator
interface PipelineStage {
  name: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
  progress: number;
  startedOn?: string;
  duration?: string;
}

interface PipelineState {
  caseId: string;
  progress: number;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  stages: PipelineStage[];
  logs: { timestamp: string; message: string }[];
}

const pipelineStates = new Map<string, PipelineState>();

const STAGE_NAMES = [
  'Data Ingestion & Validation',
  'Data Parsing & Extraction',
  'Identity Resolution',
  'Feature Engineering',
  'Financial Health Scoring',
  'Risk Assessment',
  'Explainability (SHAP)',
  'Report Generation'
];

router.get('/:caseId/pipeline', wrapAsync(async (req: Request, res: Response) => {
  const caseData = caseStore.findById(req.params.caseId);
  if (!caseData) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');

  let state = pipelineStates.get(req.params.caseId);
  if (!state) {
    // If completed or not started, initialize default based on current case state
    const isCompleted = caseData.status === CaseState.SCORED || caseData.status === CaseState.DECISIONED;
    state = {
      caseId: req.params.caseId,
      progress: isCompleted ? 100 : 0,
      status: isCompleted ? 'Completed' : 'Pending',
      stages: STAGE_NAMES.map((name) => ({
        name,
        status: isCompleted ? 'Completed' : 'Pending',
        progress: isCompleted ? 100 : 0,
        startedOn: isCompleted ? new Date(caseData.createdAt).toLocaleTimeString() : undefined,
        duration: isCompleted ? '00:00:15' : undefined
      })),
      logs: isCompleted ? [
        { timestamp: new Date(caseData.createdAt).toLocaleTimeString(), message: 'Pipeline execution started by Risk Manager' },
        { timestamp: new Date(caseData.createdAt).toLocaleTimeString(), message: 'Data ingestion completed successfully' },
        { timestamp: new Date(caseData.createdAt).toLocaleTimeString(), message: 'Data parsing & extraction completed' },
        { timestamp: new Date(caseData.createdAt).toLocaleTimeString(), message: 'Identity resolution completed' },
        { timestamp: new Date(caseData.createdAt).toLocaleTimeString(), message: 'Feature engineering completed successfully' },
        { timestamp: new Date(caseData.createdAt).toLocaleTimeString(), message: 'Financial health scoring completed' },
        { timestamp: new Date(caseData.createdAt).toLocaleTimeString(), message: 'Risk assessment completed' },
        { timestamp: new Date(caseData.createdAt).toLocaleTimeString(), message: 'Explainability vectors (SHAP) generated' },
        { timestamp: new Date(caseData.createdAt).toLocaleTimeString(), message: 'Report generated successfully. Pipeline execution complete.' }
      ] : []
    };
    pipelineStates.set(req.params.caseId, state);
  }

  res.json(state);
}));

router.post('/:caseId/run-pipeline', wrapAsync(async (req: Request, res: Response) => {
  const caseData = caseStore.findById(req.params.caseId);
  if (!caseData) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');

  let state = pipelineStates.get(req.params.caseId);
  if (state && state.status === 'Running') {
    return res.json(state);
  }

  // Update case status to In Progress (represented as DATA_FETCHING in case machine)
  caseStore.update(req.params.caseId, { status: CaseState.DATA_FETCHING });

  // Initialize new running pipeline state
  const startTime = new Date();
  state = {
    caseId: req.params.caseId,
    progress: 0,
    status: 'Running',
    stages: STAGE_NAMES.map((name, i) => ({
      name,
      status: i === 0 ? 'In Progress' : 'Pending',
      progress: i === 0 ? 0 : 0
    })),
    logs: [
      { timestamp: startTime.toLocaleTimeString(), message: 'Pipeline execution started by Risk Manager' }
    ]
  };
  pipelineStates.set(req.params.caseId, state);

  // Background pipeline simulator
  let currentStageIndex = 0;
  const intervalId = setInterval(() => {
    const currentState = pipelineStates.get(req.params.caseId);
    if (!currentState || currentState.status !== 'Running') {
      clearInterval(intervalId);
      return;
    }

    const now = new Date();
    
    // Progress current stage
    const currentStage = currentState.stages[currentStageIndex];
    if (currentStage) {
      currentStage.progress += 25;
      if (currentStage.progress >= 100) {
        currentStage.progress = 100;
        currentStage.status = 'Completed';
        currentStage.duration = `00:00:0${Math.floor(Math.random() * 5) + 1}`;
        currentStage.startedOn = now.toLocaleTimeString();

        // Add log for completed stage
        const logsMap: Record<number, string> = {
          0: 'Data Ingestion & Validation completed successfully.',
          1: 'Data Parsing & Extraction completed. Ingested bank files and GST statements.',
          2: 'Identity Resolution completed. Directors and business PAN verified.',
          3: 'Feature Engineering completed. 142 features generated.',
          4: 'Financial Health Scoring completed. Model score output generated.',
          5: 'Risk Assessment completed. Risk tiers evaluated.',
          6: 'Explainability (SHAP) vectors computed successfully.',
          7: 'Report generated successfully. Pipeline execution complete.'
        };
        currentState.logs.push({
          timestamp: now.toLocaleTimeString(),
          message: logsMap[currentStageIndex] || `Stage ${currentStage.name} complete.`
        });

        // Advance to next stage
        currentStageIndex++;
        if (currentStageIndex < currentState.stages.length) {
          currentState.stages[currentStageIndex].status = 'In Progress';
          currentState.stages[currentStageIndex].progress = 0;
          currentState.logs.push({
            timestamp: now.toLocaleTimeString(),
            message: `Starting stage: ${currentState.stages[currentStageIndex].name}...`
          });
        } else {
          // All stages complete!
          currentState.status = 'Completed';
          currentState.progress = 100;
          
          // Transition case state to SCORED
          caseStore.update(req.params.caseId, { status: CaseState.SCORED });
          
          clearInterval(intervalId);
        }
      }
    }

    // Update overall progress percentage
    const completedCount = currentState.stages.filter(s => s.status === 'Completed').length;
    const activeStage = currentState.stages.find(s => s.status === 'In Progress');
    const activeProgress = activeStage ? (activeStage.progress / currentState.stages.length) : 0;
    currentState.progress = Math.min(Math.round((completedCount / currentState.stages.length) * 100 + activeProgress), 100);

    pipelineStates.set(req.params.caseId, currentState);
  }, 800); // Speed: every stage completes in about 3.2 seconds total, quick enough for snappy UX

  res.json(state);
}));

export default router;
