import { describe, it, expect, beforeEach } from 'vitest';
import { ConsentStatus, SourceType } from '@msme-credit/shared';
import { ConsentStore } from './consent-store';
import { mockDataStore } from '../../data/mock-data';

describe('ConsentStore', () => {
  let store: ConsentStore;

  beforeEach(() => {
    mockDataStore.reset();
    store = new ConsentStore();
  });

  describe('create', () => {
    it('should create and store a new consent', () => {
      const consent = {
        consentId: 'CON-NEW-001',
        caseId: 'CASE-NEW-001',
        sourceType: SourceType.AA,
        status: ConsentStatus.PENDING,
        purposeCode: 'FHC_ASSESSMENT',
        scope: '12 months data',
        createdAt: new Date().toISOString(),
        version: 1,
      };
      const stored = store.create(consent);
      expect(stored).toEqual(consent);
      expect(store.findById('CON-NEW-001')).toEqual(consent);
    });
  });

  describe('findById', () => {
    it('should return undefined for non-existent consent', () => {
      const result = store.findById('NONEXISTENT');
      expect(result).toBeUndefined();
    });

    it('should return the correct consent', () => {
      const consent = store.findById('CON-FULL-AA-001');
      expect(consent).toBeDefined();
      expect(consent!.consentId).toBe('CON-FULL-AA-001');
      expect(consent!.caseId).toBe('CASE-FULL-001');
    });
  });

  describe('findByCase', () => {
    it('should return all consents for a case', () => {
      const consents = store.findByCase('CASE-FULL-001');
      expect(consents).toHaveLength(4);
    });

    it('should return empty array for case with no consents', () => {
      const consents = store.findByCase('UNKNOWN-CASE');
      expect(consents).toEqual([]);
    });
  });

  describe('findByCaseAndSource', () => {
    it('should filter by case and source type', () => {
      const consents = store.findByCaseAndSource('CASE-FULL-001', SourceType.GST);
      expect(consents).toHaveLength(1);
      expect(consents[0].sourceType).toBe(SourceType.GST);
    });

    it('should return empty array when no match', () => {
      const consents = store.findByCaseAndSource('CASE-FULL-001', SourceType.INVOICE);
      expect(consents).toEqual([]);
    });
  });

  describe('revoke', () => {
    it('should revoke an active consent', () => {
      const revoked = store.revoke('CON-FULL-AA-001');
      expect(revoked.status).toBe(ConsentStatus.REVOKED);
      expect(revoked.version).toBe(2);
      expect(revoked.revokedAt).toBeDefined();
    });

    it('should throw CONSENT_NOT_FOUND for missing consent', () => {
      expect(() => store.revoke('NONEXISTENT')).toThrow('Consent not found');
    });

    it('should throw ALREADY_REVOKED for already revoked consent', () => {
      store.revoke('CON-FULL-AA-001');
      expect(() => store.revoke('CON-FULL-AA-001')).toThrow('Consent already revoked');
    });

    it('should include statusCode and code in not found error', () => {
      try {
        store.revoke('NONEXISTENT');
      } catch (e: unknown) {
        const err = e as Record<string, unknown>;
        expect(err.statusCode).toBe(404);
        expect(err.code).toBe('CONSENT_NOT_FOUND');
      }
    });

    it('should include statusCode and code in already revoked error', () => {
      try {
        store.revoke('CON-FULL-AA-001');
        store.revoke('CON-FULL-AA-001');
      } catch (e: unknown) {
        const err = e as Record<string, unknown>;
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('ALREADY_REVOKED');
      }
    });
  });

  describe('amend', () => {
    it('should amend a consent with new scope', () => {
      const amended = store.amend('CON-FULL-AA-001', { scope: '24 months transaction data' });
      expect(amended.status).toBe(ConsentStatus.AMENDED);
      expect(amended.scope).toBe('24 months transaction data');
      expect(amended.version).toBe(2);
      expect(amended.amendedFrom).toBe('CON-FULL-AA-001');
    });

    it('should throw CONSENT_NOT_FOUND for missing consent', () => {
      expect(() => store.amend('NONEXISTENT', { scope: 'new' })).toThrow('Consent not found');
    });

    it('should throw CANNOT_AMEND_REVOKED for revoked consent', () => {
      store.revoke('CON-FULL-AA-001');
      expect(() => store.amend('CON-FULL-AA-001', { scope: 'new' })).toThrow(
        'Cannot amend revoked consent'
      );
    });

    it('should create a new consent ID based on version', () => {
      const amended = store.amend('CON-FULL-AA-001', { scope: 'new scope' });
      expect(amended.consentId).toBe('CON-FULL-AA-001-v2');
    });

    it('should preserve original caseId and sourceType', () => {
      const amended = store.amend('CON-FULL-AA-001', { scope: 'new scope' });
      expect(amended.caseId).toBe('CASE-FULL-001');
      expect(amended.sourceType).toBe(SourceType.AA);
    });
  });

  describe('expired consent', () => {
    it('should find expired consent by id but should not block operations', () => {
      const expiredConsent = {
        consentId: 'CON-EXP-001',
        caseId: 'CASE-EXP-001',
        sourceType: SourceType.AA,
        status: ConsentStatus.EXPIRED,
        purposeCode: 'FHC_ASSESSMENT',
        scope: 'old data',
        createdAt: '2025-01-01T00:00:00Z',
        expiresAt: '2025-06-01T00:00:00Z',
        version: 1,
      };
      store.create(expiredConsent);
      const found = store.findById('CON-EXP-001');
      expect(found).toBeDefined();
      expect(found!.status).toBe(ConsentStatus.EXPIRED);
    });

    it('should not be returned as active for a case', () => {
      const expiredConsent = {
        consentId: 'CON-EXP-002',
        caseId: 'CASE-TEST-001',
        sourceType: SourceType.AA,
        status: ConsentStatus.EXPIRED,
        purposeCode: 'FHC_ASSESSMENT',
        scope: 'old data',
        createdAt: '2025-01-01T00:00:00Z',
        expiresAt: '2025-06-01T00:00:00Z',
        version: 1,
      };
      store.create(expiredConsent);
      const consents = store.findByCase('CASE-TEST-001');
      expect(consents).toHaveLength(1);
    });
  });
});
