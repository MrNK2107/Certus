import { DecisionRecord, DecisionRequest, OverrideRequest } from '../../shared';
import { mockDataStore } from '../../data/mock-data';
import { v4 as uuidv4 } from 'uuid';

export class DecisionStore {
  findByCase(caseId: string): DecisionRecord | undefined {
    const decisions = Array.from(mockDataStore.decisions.values())
      .filter(d => d.caseId === caseId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return decisions.length > 0 ? decisions[0] : undefined;
  }

  findAllByCase(caseId: string): DecisionRecord[] {
    return Array.from(mockDataStore.decisions.values())
      .filter(d => d.caseId === caseId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  findById(decisionId: string): DecisionRecord | undefined {
    return mockDataStore.decisions.get(decisionId);
  }

  create(caseId: string, request: DecisionRequest, decisionBy: string): DecisionRecord {
    const fhc = mockDataStore.fhcResults.get(caseId);
    const decision: DecisionRecord = {
      decisionId: `DEC-${uuidv4().substring(0, 8)}`,
      caseId,
      decisionType: request.decisionType,
      decisionBy,
      decisionReason: request.decisionReason,
      createdAt: new Date().toISOString(),
      makerCheckerApprovedBy: request.makerCheckerApprovedBy,
      policyVersion: fhc?.policyVersion || '1.2',
      fhcVersion: fhc?.version || 1,
    };
    mockDataStore.decisions.set(decision.decisionId, decision);
    return decision;
  }

  override(caseId: string, request: OverrideRequest, decisionBy: string): DecisionRecord {
    const existing = this.findByCase(caseId);
    const fhc = mockDataStore.fhcResults.get(caseId);
    const decision: DecisionRecord = {
      decisionId: `DEC-${uuidv4().substring(0, 8)}`,
      caseId,
      decisionType: request.decisionType,
      decisionBy,
      decisionReason: request.overrideReason,
      createdAt: new Date().toISOString(),
      overriddenFrom: existing?.decisionId,
      policyVersion: fhc?.policyVersion || '1.2',
      fhcVersion: fhc?.version || 1,
    };
    mockDataStore.decisions.set(decision.decisionId, decision);
    return decision;
  }
}

export const decisionStore = new DecisionStore();
