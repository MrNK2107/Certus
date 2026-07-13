import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../main';
import { mockDataStore } from '../data/mock-data';
import { CaseState, ConsentStatus, SourceType } from '../shared';

beforeEach(() => {
  mockDataStore.reset();
});

describe('Health', () => {
  it('GET /api/health returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('requestId');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body.data.status).toBe('ok');
  });
});

describe('Cases API', () => {
  const CASES_BASE = '/api/v1/cases';

  describe('GET /', () => {
    it('returns 200 with paginated case list', async () => {
      const res = await request(app).get(CASES_BASE);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('requestId');
      expect(res.body).toHaveProperty('timestamp');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('pageSize');
      expect(res.body.meta).toHaveProperty('totalPages');
      expect(res.body.meta.total).toBeGreaterThanOrEqual(6);
      expect(res.body.meta.page).toBe(1);
    });

    it('filters by status', async () => {
      const res = await request(app).get(`${CASES_BASE}?status=DRAFT`);
      expect(res.status).toBe(200);
      for (const c of res.body.data) {
        expect(c.status).toBe('DRAFT');
      }
    });

    it('filters by sector', async () => {
      const res = await request(app).get(`${CASES_BASE}?sector=RETAIL`);
      expect(res.status).toBe(200);
      for (const c of res.body.data) {
        expect(c.sector).toBe('RETAIL');
      }
    });
  });

  describe('GET /:caseId', () => {
    it('returns 200 with a single case', async () => {
      const res = await request(app).get(`${CASES_BASE}/CASE-FULL-001`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('requestId');
      expect(res.body.data.caseId).toBe('CASE-FULL-001');
      expect(res.body.data.businessName).toBe('ABC Retail Pvt Ltd');
      expect(res.body.data.status).toBe(CaseState.SCORED);
    });

    it('returns 404 for unknown case', async () => {
      const res = await request(app).get(`${CASES_BASE}/UNKNOWN-CASE`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('requestId');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body.errorCode).toBe('CASE_NOT_FOUND');
    });
  });

  describe('POST /', () => {
    it('returns 201 with created case for valid body', async () => {
      const res = await request(app)
        .post(CASES_BASE)
        .send({ businessName: 'Test Business', sector: 'RETAIL', ownerTeam: 'Test Team', ownerUser: 'test@bank.com' });
      expect(res.status).toBe(201);
      expect(res.body.data.caseId).toMatch(/^CASE-/);
      expect(res.body.data.businessName).toBe('Test Business');
      expect(res.body.data.status).toBe(CaseState.DRAFT);
    });

    it('returns 400 when businessName is missing', async () => {
      const res = await request(app)
        .post(CASES_BASE)
        .send({ sector: 'RETAIL' });
      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /:caseId', () => {
    it('returns 200 with updated case', async () => {
      const res = await request(app)
        .patch(`${CASES_BASE}/CASE-DRAFT-001`)
        .send({ businessName: 'Updated Enterprise' });
      expect(res.status).toBe(200);
      expect(res.body.data.businessName).toBe('Updated Enterprise');
      expect(res.body.data.caseId).toBe('CASE-DRAFT-001');
    });

    it('returns 404 for unknown case', async () => {
      const res = await request(app)
        .patch(`${CASES_BASE}/UNKNOWN-CASE`)
        .send({ businessName: 'Test' });
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CASE_NOT_FOUND');
    });
  });

  describe('POST /:caseId/transition', () => {
    it('returns 200 on valid state transition', async () => {
      const res = await request(app)
        .post(`${CASES_BASE}/CASE-DRAFT-001/transition`)
        .send({ toState: CaseState.CONSENT_PENDING });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(CaseState.CONSENT_PENDING);
    });

    it('returns 400 on invalid state transition', async () => {
      const res = await request(app)
        .post(`${CASES_BASE}/CASE-DRAFT-001/transition`)
        .send({ toState: CaseState.DECISIONED });
      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('INVALID_TRANSITION');
    });

    it('returns 400 when transitioning from a terminal state', async () => {
      const res = await request(app)
        .post(`${CASES_BASE}/CASE-DECIDED-001/transition`)
        .send({ toState: CaseState.UNDER_REVIEW });
      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('TERMINAL_STATE');
    });

    it('returns 400 when toState is missing', async () => {
      const res = await request(app)
        .post(`${CASES_BASE}/CASE-DRAFT-001/transition`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('returns 404 for unknown case', async () => {
      const res = await request(app)
        .post(`${CASES_BASE}/UNKNOWN/transition`)
        .send({ toState: CaseState.FAILED });
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CASE_NOT_FOUND');
    });
  });

  describe('GET /:caseId/summary', () => {
    it('returns 200 with case summary', async () => {
      const res = await request(app).get(`${CASES_BASE}/CASE-FULL-001/summary`);
      expect(res.status).toBe(200);
      expect(res.body.data.caseId).toBe('CASE-FULL-001');
      expect(res.body.data).toHaveProperty('overallHealth');
      expect(res.body.data).toHaveProperty('confidence');
      expect(res.body.data).toHaveProperty('completeness');
    });

    it('returns 404 for unknown case', async () => {
      const res = await request(app).get(`${CASES_BASE}/UNKNOWN/summary`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CASE_NOT_FOUND');
    });
  });

  describe('GET /:caseId/timeline', () => {
    it('returns 200 with timeline events', async () => {
      const res = await request(app).get(`${CASES_BASE}/CASE-FULL-001/timeline`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
    });

    it('returns 404 for unknown case', async () => {
      const res = await request(app).get(`${CASES_BASE}/UNKNOWN/timeline`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CASE_NOT_FOUND');
    });
  });

  describe('DELETE /:caseId', () => {
    it('returns 204 for draft case', async () => {
      const res = await request(app).delete(`${CASES_BASE}/CASE-DRAFT-001`);
      expect(res.status).toBe(204);
    });

    it('returns 400 for non-draft case', async () => {
      const res = await request(app).delete(`${CASES_BASE}/CASE-FULL-001`);
      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('CANNOT_DELETE');
    });

    it('returns 404 for unknown case', async () => {
      const res = await request(app).delete(`${CASES_BASE}/UNKNOWN`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CASE_NOT_FOUND');
    });
  });
});

describe('Scoring API', () => {
  const SCORES_BASE = '/api/v1/scores';

  describe('GET /:caseId/fhc', () => {
    it('returns 200 with FHC result for existing case', async () => {
      const res = await request(app).get(`${SCORES_BASE}/CASE-FULL-001/fhc`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('fhcResultId');
      expect(res.body.data).toHaveProperty('caseId');
      expect(res.body.data).toHaveProperty('overallHealth');
      expect(res.body.data).toHaveProperty('healthBand');
      expect(res.body.data).toHaveProperty('confidence');
      expect(res.body.data).toHaveProperty('completeness');
      expect(res.body.data).toHaveProperty('pillarScores');
      expect(res.body.data).toHaveProperty('strengths');
      expect(res.body.data).toHaveProperty('risks');
      expect(res.body.data).toHaveProperty('missingSources');
      expect(res.body.data).toHaveProperty('anomalies');
      expect(res.body.data).toHaveProperty('recommendation');
      expect(res.body.data).toHaveProperty('modelVersion');
      expect(res.body.data).toHaveProperty('policyVersion');
    });

    it('returns 200 with FHC containing pillarScores, confidence, completeness, healthBand', async () => {
      const res = await request(app).get(`${SCORES_BASE}/CASE-FULL-001/fhc`);
      expect(res.status).toBe(200);
      const fhc = res.body.data;
      expect(fhc.overallHealth).toBeGreaterThanOrEqual(0);
      expect(fhc.overallHealth).toBeLessThanOrEqual(100);
      expect(fhc.confidence).toBeGreaterThanOrEqual(0);
      expect(fhc.confidence).toBeLessThanOrEqual(100);
      expect(fhc.completeness).toBeGreaterThanOrEqual(0);
      expect(fhc.completeness).toBeLessThanOrEqual(100);
      expect(['STRONG', 'PROMISING_BUT_THIN', 'NEEDS_REVIEW', 'RISKY']).toContain(fhc.healthBand);
      expect(Array.isArray(fhc.pillarScores)).toBe(true);
      expect(fhc.pillarScores.length).toBe(6);
    });

    it('returns 404 for unknown case', async () => {
      const res = await request(app).get(`${SCORES_BASE}/UNKNOWN-CASE/fhc`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CASE_NOT_FOUND');
    });
  });

  describe('GET /:caseId/pillars', () => {
    it('returns 200 with pillar scores', async () => {
      const res = await request(app).get(`${SCORES_BASE}/CASE-FULL-001/pillars`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(6);
      expect(res.body.data[0]).toHaveProperty('pillarName');
      expect(res.body.data[0]).toHaveProperty('score');
      expect(res.body.data[0]).toHaveProperty('confidence');
    });

    it('returns 404 for unknown case', async () => {
      const res = await request(app).get(`${SCORES_BASE}/UNKNOWN/pillars`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CASE_NOT_FOUND');
    });
  });

  describe('POST /:caseId/compute', () => {
    it('returns 200 with computed score', async () => {
      const res = await request(app).post(`${SCORES_BASE}/CASE-DRAFT-001/compute`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('overallHealth');
      expect(res.body.data.caseId).toBe('CASE-DRAFT-001');
    });

    it('returns 404 for unknown case', async () => {
      const res = await request(app).post(`${SCORES_BASE}/UNKNOWN/compute`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CASE_NOT_FOUND');
    });
  });

  describe('GET /:caseId/explanations', () => {
    it('returns 200 with explanations', async () => {
      const res = await request(app).get(`${SCORES_BASE}/CASE-FULL-001/explanations`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('overallHealth');
      expect(res.body.data).toHaveProperty('healthBand');
      expect(res.body.data).toHaveProperty('confidence');
      expect(res.body.data).toHaveProperty('completeness');
      expect(res.body.data).toHaveProperty('pillarExplanations');
      expect(Array.isArray(res.body.data.pillarExplanations)).toBe(true);
    });

    it('returns 404 for unknown case', async () => {
      const res = await request(app).get(`${SCORES_BASE}/UNKNOWN/explanations`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CASE_NOT_FOUND');
    });
  });
});

describe('Consents API', () => {
  const CONSENTS_BASE = '/api/v1/consents';

  describe('GET /', () => {
    it('returns 200 with consent list', async () => {
      const res = await request(app).get(CONSENTS_BASE);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(12);
    });

    it('filters by caseId', async () => {
      const res = await request(app).get(`${CONSENTS_BASE}?caseId=CASE-FULL-001`);
      expect(res.status).toBe(200);
      for (const c of res.body.data) {
        expect(c.caseId).toBe('CASE-FULL-001');
      }
    });

    it('returns 404 for unknown caseId filter', async () => {
      const res = await request(app).get(`${CONSENTS_BASE}?caseId=UNKNOWN`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CASE_NOT_FOUND');
    });
  });

  describe('GET /:consentId', () => {
    it('returns 200 with a single consent', async () => {
      const res = await request(app).get(`${CONSENTS_BASE}/CON-FULL-AA-001`);
      expect(res.status).toBe(200);
      expect(res.body.data.consentId).toBe('CON-FULL-AA-001');
      expect(res.body.data.caseId).toBe('CASE-FULL-001');
    });

    it('returns 404 for unknown consent', async () => {
      const res = await request(app).get(`${CONSENTS_BASE}/UNKNOWN-CONSENT`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CONSENT_NOT_FOUND');
    });
  });

  describe('POST /', () => {
    it('returns 201 with created consent', async () => {
      const res = await request(app)
        .post(CONSENTS_BASE)
        .send({ caseId: 'CASE-FULL-001', sourceType: 'EPFO', scope: 'EPFO data access' });
      expect(res.status).toBe(201);
      expect(res.body.data.consentId).toMatch(/^CON-/);
      expect(res.body.data.status).toBe(ConsentStatus.PENDING);
    });

    it('returns 400 when caseId or sourceType is missing', async () => {
      const res = await request(app)
        .post(CONSENTS_BASE)
        .send({ caseId: 'CASE-FULL-001' });
      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('returns 404 for unknown caseId', async () => {
      const res = await request(app)
        .post(CONSENTS_BASE)
        .send({ caseId: 'UNKNOWN', sourceType: 'AA' });
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CASE_NOT_FOUND');
    });
  });

  describe('POST /:consentId/revoke', () => {
    it('returns 200 on successful revoke', async () => {
      const res = await request(app).post(`${CONSENTS_BASE}/CON-FULL-AA-001/revoke`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(ConsentStatus.REVOKED);
      expect(res.body.data).toHaveProperty('revokedAt');
    });

    it('returns 400 for already revoked consent', async () => {
      const res = await request(app).post(`${CONSENTS_BASE}/CON-REV-BUR-001/revoke`);
      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('ALREADY_REVOKED');
    });

    it('returns 404 for unknown consent', async () => {
      const res = await request(app).post(`${CONSENTS_BASE}/UNKNOWN/revoke`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CONSENT_NOT_FOUND');
    });
  });

  describe('POST /:consentId/amend', () => {
    it('returns 200 with amended consent', async () => {
      const res = await request(app)
        .post(`${CONSENTS_BASE}/CON-FULL-AA-001/amend`)
        .send({ scope: '24 months transaction data' });
      expect(res.status).toBe(200);
      expect(res.body.data.amendedFrom).toBe('CON-FULL-AA-001');
      expect(res.body.data.version).toBe(2);
      expect(res.body.data.scope).toBe('24 months transaction data');
    });

    it('returns 400 for revoked consent', async () => {
      const res = await request(app)
        .post(`${CONSENTS_BASE}/CON-REV-BUR-001/amend`)
        .send({ scope: 'test' });
      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('CANNOT_AMEND_REVOKED');
    });

    it('returns 404 for unknown consent', async () => {
      const res = await request(app)
        .post(`${CONSENTS_BASE}/UNKNOWN/amend`)
        .send({ scope: 'test' });
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CONSENT_NOT_FOUND');
    });
  });
});

describe('Sources API', () => {
  const SOURCES_BASE = '/api/v1/sources';

  describe('GET /', () => {
    it('returns 200 with source types', async () => {
      const res = await request(app).get(SOURCES_BASE);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(6);
      expect(res.body.data[0]).toHaveProperty('type');
      expect(res.body.data[0]).toHaveProperty('label');
      expect(res.body.data[0]).toHaveProperty('priority');
    });
  });

  describe('GET /connections', () => {
    it('returns 200 with all connections', async () => {
      const res = await request(app).get(`${SOURCES_BASE}/connections`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(12);
    });

    it('filters connections by caseId', async () => {
      const res = await request(app).get(`${SOURCES_BASE}/connections?caseId=CASE-FULL-001`);
      expect(res.status).toBe(200);
      for (const c of res.body.data) {
        expect(c.caseId).toBe('CASE-FULL-001');
      }
    });
  });

  describe('GET /connections/:sourceLinkId', () => {
    it('returns 200 with a single connection', async () => {
      const res = await request(app).get(`${SOURCES_BASE}/connections/SL-FULL-AA`);
      expect(res.status).toBe(200);
      expect(res.body.data.sourceLinkId).toBe('SL-FULL-AA');
    });

    it('returns 404 for unknown connection', async () => {
      const res = await request(app).get(`${SOURCES_BASE}/connections/UNKNOWN`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CONNECTION_NOT_FOUND');
    });
  });

  describe('POST /connections', () => {
    it('returns 201 with created connection', async () => {
      const res = await request(app)
        .post(`${SOURCES_BASE}/connections`)
        .send({ caseId: 'CASE-FULL-001', sourceType: SourceType.EPFO });
      expect(res.status).toBe(201);
      expect(res.body.data.sourceLinkId).toMatch(/^SL-/);
      expect(res.body.data.status).toBe('CONNECTING');
    });

    it('returns 400 when caseId or sourceType is missing', async () => {
      const res = await request(app)
        .post(`${SOURCES_BASE}/connections`)
        .send({ caseId: 'CASE-FULL-001' });
      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /connections/:sourceLinkId/unlink', () => {
    it('returns 200 with unlinked connection', async () => {
      const res = await request(app).post(`${SOURCES_BASE}/connections/SL-FULL-AA/unlink`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('REVOKED');
    });

    it('returns 404 for unknown connection', async () => {
      const res = await request(app).post(`${SOURCES_BASE}/connections/UNKNOWN/unlink`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CONNECTION_NOT_FOUND');
    });
  });

  describe('POST /connections/:sourceLinkId/fetch', () => {
    it('returns 201 with fetch record', async () => {
      const res = await request(app).post(`${SOURCES_BASE}/connections/SL-FULL-AA/fetch`);
      expect(res.status).toBe(201);
      expect(res.body.data.fetchId).toMatch(/^FETCH-/);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });

    it('returns 404 for unknown connection', async () => {
      const res = await request(app).post(`${SOURCES_BASE}/connections/UNKNOWN/fetch`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CONNECTION_NOT_FOUND');
    });
  });

  describe('GET /fetches', () => {
    it('returns 200 with fetch records', async () => {
      const res = await request(app).get(`${SOURCES_BASE}/fetches`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('filters fetches by caseId', async () => {
      const res = await request(app).get(`${SOURCES_BASE}/fetches?caseId=CASE-FULL-001`);
      expect(res.status).toBe(200);
      for (const f of res.body.data) {
        expect(f.caseId).toBe('CASE-FULL-001');
      }
    });
  });
});

describe('Decisions API', () => {
  const DECISIONS_BASE = '/api/v1/decisions';

  describe('GET /:caseId', () => {
    it('returns 200 with latest decision', async () => {
      const res = await request(app).get(`${DECISIONS_BASE}/CASE-DECIDED-001`);
      expect(res.status).toBe(200);
      expect(res.body.data.caseId).toBe('CASE-DECIDED-001');
      expect(res.body.data.decisionType).toBe('APPROVE');
      expect(res.body.data).toHaveProperty('decisionReason');
    });

    it('returns 404 for case with no decision', async () => {
      const res = await request(app).get(`${DECISIONS_BASE}/CASE-FULL-001`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('DECISION_NOT_FOUND');
    });

    it('returns 404 for unknown case', async () => {
      const res = await request(app).get(`${DECISIONS_BASE}/UNKNOWN`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CASE_NOT_FOUND');
    });
  });

  describe('GET /:caseId/history', () => {
    it('returns 200 with decision history', async () => {
      const res = await request(app).get(`${DECISIONS_BASE}/CASE-DECIDED-001/history`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('returns 404 for unknown case', async () => {
      const res = await request(app).get(`${DECISIONS_BASE}/UNKNOWN/history`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CASE_NOT_FOUND');
    });
  });

  describe('POST /:caseId', () => {
    it('returns 201 with created decision', async () => {
      const res = await request(app)
        .post(`${DECISIONS_BASE}/CASE-FULL-001`)
        .send({ decisionType: 'APPROVE', decisionReason: 'Strong financial health' });
      expect(res.status).toBe(201);
      expect(res.body.data.decisionId).toMatch(/^DEC-/);
      expect(res.body.data.decisionType).toBe('APPROVE');
    });

    it('returns 400 when decisionType is missing', async () => {
      const res = await request(app)
        .post(`${DECISIONS_BASE}/CASE-FULL-001`)
        .send({ decisionReason: 'Optional rationale provided' });
      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('returns 404 for unknown case', async () => {
      const res = await request(app)
        .post(`${DECISIONS_BASE}/UNKNOWN`)
        .send({ decisionType: 'APPROVE', decisionReason: 'Test' });
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CASE_NOT_FOUND');
    });
  });

  describe('POST /:caseId/override', () => {
    it('returns 200 with overridden decision', async () => {
      const res = await request(app)
        .post(`${DECISIONS_BASE}/CASE-DECIDED-001/override`)
        .send({ decisionType: 'DECLINE', overrideReason: 'Policy exception', policyReference: 'POL-002' });
      expect(res.status).toBe(200);
      expect(res.body.data.decisionType).toBe('DECLINE');
      expect(res.body.data).toHaveProperty('overriddenFrom');
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post(`${DECISIONS_BASE}/CASE-DECIDED-001/override`)
        .send({ decisionType: 'DECLINE' });
      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    });
  });
});

describe('Audit API', () => {
  const AUDIT_BASE = '/api/v1/audit';

  describe('GET /events', () => {
    it('returns 200 with paginated audit events', async () => {
      const res = await request(app).get(`${AUDIT_BASE}/events`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('requestId');
      expect(res.body).toHaveProperty('timestamp');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('pageSize');
      expect(res.body.meta).toHaveProperty('totalPages');
      expect(res.body.meta.total).toBeGreaterThanOrEqual(14);
    });

    it('filters by caseId', async () => {
      const res = await request(app).get(`${AUDIT_BASE}/events?caseId=CASE-FULL-001`);
      expect(res.status).toBe(200);
      for (const e of res.body.data) {
        expect(e.caseId).toBe('CASE-FULL-001');
      }
    });

    it('filters by action', async () => {
      const res = await request(app).get(`${AUDIT_BASE}/events?action=CASE_CREATED`);
      expect(res.status).toBe(200);
      for (const e of res.body.data) {
        expect(e.action).toBe('CASE_CREATED');
      }
    });
  });

  describe('GET /events/:eventId', () => {
    it('returns 200 with a single event', async () => {
      const res = await request(app).get(`${AUDIT_BASE}/events/AUD-FULL-001`);
      expect(res.status).toBe(200);
      expect(res.body.data ? res.body.data.auditEventId : res.body.auditEventId).toBe('AUD-FULL-001');
    });

    it('returns 404 for unknown event', async () => {
      const res = await request(app).get(`${AUDIT_BASE}/events/UNKNOWN`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('EVENT_NOT_FOUND');
    });
  });

  describe('GET /access-logs', () => {
    it('returns 200 with access logs', async () => {
      const res = await request(app).get(`${AUDIT_BASE}/access-logs`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});

describe('Governance API', () => {
  const GOV_BASE = '/api/v1/governance';

  describe('GET /policies', () => {
    it('returns 200 with policy list', async () => {
      const res = await request(app).get(`${GOV_BASE}/policies`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data[0]).toHaveProperty('policyId');
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('rules');
    });
  });

  describe('GET /policies/:policyId', () => {
    it('returns 200 with a single policy', async () => {
      const res = await request(app).get(`${GOV_BASE}/policies/POL-001`);
      expect(res.status).toBe(200);
      expect(res.body.data.policyId).toBe('POL-001');
    });

    it('returns 404 for unknown policy', async () => {
      const res = await request(app).get(`${GOV_BASE}/policies/UNKNOWN`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('POLICY_NOT_FOUND');
    });
  });

  describe('POST /policies', () => {
    it('returns 201 with created policy', async () => {
      const res = await request(app)
        .post(`${GOV_BASE}/policies`)
        .send({ name: 'Test Policy', rules: [] });
      expect(res.status).toBe(201);
      expect(res.body.data.policyId).toMatch(/^POL-/);
      expect(res.body.data.name).toBe('Test Policy');
    });
  });

  describe('GET /models', () => {
    it('returns 200 with model versions', async () => {
      const res = await request(app).get(`${GOV_BASE}/models`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data[0]).toHaveProperty('versionId');
      expect(res.body.data[0]).toHaveProperty('version');
      expect(res.body.data[0]).toHaveProperty('active');
    });
  });

  describe('GET /reason-codes', () => {
    it('returns 200 with reason codes', async () => {
      const res = await request(app).get(`${GOV_BASE}/reason-codes`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(17);
      for (const rc of res.body.data) {
        expect(rc.active).toBe(true);
      }
    });
  });
});

describe('Ops API', () => {
  const OPS_BASE = '/api/v1/ops';

  describe('GET /health', () => {
    it('returns 200 with platform health', async () => {
      const res = await request(app).get(`${OPS_BASE}/health`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('status');
      expect(res.body.data.status).toBe('HEALTHY');
    });
  });

  describe('GET /connectors', () => {
    it('returns 200 with connector status list', async () => {
      const res = await request(app).get(`${OPS_BASE}/connectors`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(6);
      expect(res.body.data[0]).toHaveProperty('sourceType');
      expect(res.body.data[0]).toHaveProperty('status');
    });
  });

  describe('GET /connectors/:sourceType', () => {
    it('returns 200 with single connector health', async () => {
      const res = await request(app).get(`${OPS_BASE}/connectors/AA`);
      expect(res.status).toBe(200);
      expect(res.body.data.sourceType).toBe('AA');
    });

    it('returns 404 for unknown source type', async () => {
      const res = await request(app).get(`${OPS_BASE}/connectors/UNKNOWN`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('CONNECTOR_NOT_FOUND');
    });
  });

  describe('GET /alerts', () => {
    it('returns 200 with alerts list', async () => {
      const res = await request(app).get(`${OPS_BASE}/alerts`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('filters alerts by severity', async () => {
      const res = await request(app).get(`${OPS_BASE}/alerts?severity=CRITICAL`);
      expect(res.status).toBe(200);
      for (const a of res.body.data) {
        expect(a.severity).toBe('CRITICAL');
      }
    });

    it('filters alerts by status', async () => {
      const res = await request(app).get(`${OPS_BASE}/alerts?status=OPEN`);
      expect(res.status).toBe(200);
      for (const a of res.body.data) {
        expect(a.status).toBe('OPEN');
      }
    });
  });

  describe('GET /alerts/:alertId', () => {
    it('returns 200 with single alert', async () => {
      const res = await request(app).get(`${OPS_BASE}/alerts/ALERT-001`);
      expect(res.status).toBe(200);
      expect(res.body.data.alertId).toBe('ALERT-001');
    });

    it('returns 404 for unknown alert', async () => {
      const res = await request(app).get(`${OPS_BASE}/alerts/UNKNOWN`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('ALERT_NOT_FOUND');
    });
  });

  describe('POST /alerts/:alertId/acknowledge', () => {
    it('returns 200 with acknowledged alert', async () => {
      const res = await request(app).post(`${OPS_BASE}/alerts/ALERT-001/acknowledge`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('ACKNOWLEDGED');
    });

    it('returns 404 for unknown alert', async () => {
      const res = await request(app).post(`${OPS_BASE}/alerts/UNKNOWN/acknowledge`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('ALERT_NOT_FOUND');
    });
  });

  describe('POST /alerts/:alertId/resolve', () => {
    it('returns 200 with resolved alert', async () => {
      const res = await request(app).post(`${OPS_BASE}/alerts/ALERT-001/resolve`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('RESOLVED');
    });

    it('returns 404 for unknown alert', async () => {
      const res = await request(app).post(`${OPS_BASE}/alerts/UNKNOWN/resolve`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('ALERT_NOT_FOUND');
    });
  });
});

describe('Admin API', () => {
  const ADMIN_BASE = '/api/v1/admin';

  describe('GET /users', () => {
    it('returns 200 with user list', async () => {
      const res = await request(app).get(`${ADMIN_BASE}/users`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(8);
      expect(res.body.data[0]).toHaveProperty('userId');
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('email');
      expect(res.body.data[0]).toHaveProperty('role');
    });

    it('filters by role', async () => {
      const res = await request(app).get(`${ADMIN_BASE}/users?role=UNDERWRITER`);
      expect(res.status).toBe(200);
      for (const u of res.body.data) {
        expect(u.role).toBe('UNDERWRITER');
      }
    });

    it('filters by status', async () => {
      const res = await request(app).get(`${ADMIN_BASE}/users?status=INACTIVE`);
      expect(res.status).toBe(200);
      for (const u of res.body.data) {
        expect(u.status).toBe('INACTIVE');
      }
    });
  });

  describe('GET /users/:userId', () => {
    it('returns 200 with a single user', async () => {
      const res = await request(app).get(`${ADMIN_BASE}/users/USR-001`);
      expect(res.status).toBe(200);
      expect(res.body.data.userId).toBe('USR-001');
    });

    it('returns 404 for unknown user', async () => {
      const res = await request(app).get(`${ADMIN_BASE}/users/UNKNOWN`);
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('USER_NOT_FOUND');
    });
  });

  describe('POST /users', () => {
    it('returns 201 with created user', async () => {
      const res = await request(app)
        .post(`${ADMIN_BASE}/users`)
        .send({ name: 'New User', email: 'new@bank.com', role: 'UNDERWRITER', team: 'Mumbai Underwriting', branch: 'BR-MUM-001' });
      expect(res.status).toBe(201);
      expect(res.body.data.userId).toMatch(/^USR-/);
      expect(res.body.data.name).toBe('New User');
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post(`${ADMIN_BASE}/users`)
        .send({ name: 'New User' });
      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /roles', () => {
    it('returns 200 with role/permission list', async () => {
      const res = await request(app).get(`${ADMIN_BASE}/roles`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(8);
      expect(res.body.data[0]).toHaveProperty('roleId');
      expect(res.body.data[0]).toHaveProperty('roleName');
      expect(res.body.data[0]).toHaveProperty('permissions');
    });
  });

  describe('GET /branches', () => {
    it('returns 200 with branch list', async () => {
      const res = await request(app).get(`${ADMIN_BASE}/branches`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data[0]).toHaveProperty('branchId');
      expect(res.body.data[0]).toHaveProperty('name');
    });
  });
});
