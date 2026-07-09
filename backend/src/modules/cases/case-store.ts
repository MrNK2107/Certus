import {
  Case, CaseState, CaseSummary, FilterParams, PaginationParams
} from '@msme-credit/shared';
import { mockDataStore } from '../../data/mock-data';

export class CaseStore {
  findAll(filters?: FilterParams, pagination?: PaginationParams): { cases: CaseSummary[]; total: number } {
    let cases = Array.from(mockDataStore.cases.values());

    if (filters) {
      if (filters.status) {
        cases = cases.filter(c => c.status === filters.status);
      }
      if (filters.sector) {
        cases = cases.filter(c => c.sector === filters.sector);
      }
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        cases = cases.filter(c =>
          c.businessName.toLowerCase().includes(term) ||
          c.caseId.toLowerCase().includes(term)
        );
      }
      if (filters.dateFrom) {
        cases = cases.filter(c => c.createdAt >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        cases = cases.filter(c => c.createdAt <= filters.dateTo!);
      }
    }

    const total = cases.length;

    if (pagination) {
      const page = pagination.page || 1;
      const pageSize = pagination.pageSize || 20;
      const start = (page - 1) * pageSize;
      cases = cases.slice(start, start + pageSize);
    }

    const summaries: CaseSummary[] = cases.map(c => ({
      caseId: c.caseId,
      businessName: c.businessName,
      sector: c.sector,
      status: c.status,
      createdAt: c.createdAt,
    }));

    return { cases: summaries, total };
  }

  findById(caseId: string): Case | undefined {
    return mockDataStore.cases.get(caseId);
  }

  create(caseData: Case): Case {
    mockDataStore.cases.set(caseData.caseId, caseData);
    return caseData;
  }

  update(caseId: string, updates: Partial<Case>): Case {
    const existing = mockDataStore.cases.get(caseId);
    if (!existing) {
      throw Object.assign(new Error('Case not found'), { statusCode: 404, code: 'CASE_NOT_FOUND' });
    }
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    mockDataStore.cases.set(caseId, updated);
    return updated;
  }

  delete(caseId: string): boolean {
    return mockDataStore.cases.delete(caseId);
  }

  findByStatus(status: CaseState): Case[] {
    return Array.from(mockDataStore.cases.values()).filter(c => c.status === status);
  }

  getSummary(caseId: string): CaseSummary | undefined {
    const c = mockDataStore.cases.get(caseId);
    if (!c) return undefined;
    const fhc = mockDataStore.fhcResults.get(caseId);
    return {
      caseId: c.caseId,
      businessName: c.businessName,
      sector: c.sector,
      status: c.status,
      createdAt: c.createdAt,
      overallHealth: fhc?.overallHealth,
      confidence: fhc?.confidence,
      completeness: fhc?.completeness,
    };
  }
}

export const caseStore = new CaseStore();
