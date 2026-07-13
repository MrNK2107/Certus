import { describe, it, expect, beforeEach } from 'vitest';
import { HealthBand, SourceType } from '../../shared';
import { ScoringService } from './scoring-service';
import { mockDataStore } from '../../data/mock-data';

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(() => {
    mockDataStore.reset();
    service = new ScoringService();
  });

  describe('computeScore - full data case (CASE-FULL-001)', () => {
    it('should compute overall health score', () => {
      const result = service.computeScore('CASE-FULL-001');
      expect(result.overallHealth).toBeGreaterThanOrEqual(0);
      expect(result.overallHealth).toBeLessThanOrEqual(100);
    });

    it('should assign STRONG health band for high scores', () => {
      const result = service.computeScore('CASE-FULL-001');
      expect(result.overallHealth).toBeGreaterThanOrEqual(70);
      expect(result.healthBand).toBe(HealthBand.STRONG);
    });

    it('should have 6 pillar scores', () => {
      const result = service.computeScore('CASE-FULL-001');
      expect(result.pillarScores).toHaveLength(6);
    });

    it('should compute high confidence for full data', () => {
      const result = service.computeScore('CASE-FULL-001');
      expect(result.confidence).toBeGreaterThanOrEqual(70);
    });

    it('should compute high completeness for full data', () => {
      const result = service.computeScore('CASE-FULL-001');
      expect(result.completeness).toBeGreaterThanOrEqual(70);
    });

    it('should have strengths for pillars with score >= 65', () => {
      const result = service.computeScore('CASE-FULL-001');
      expect(result.strengths.length).toBeGreaterThan(0);
    });

    it('should have reason codes on all pillar scores', () => {
      const result = service.computeScore('CASE-FULL-001');
      for (const p of result.pillarScores) {
        expect(p.reasonCodes.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should include modelVersion and policyVersion in result', () => {
      const result = service.computeScore('CASE-FULL-001');
      expect(result.modelVersion).toBe('1.0.0');
      expect(result.policyVersion).toBe('1.2');
    });

    it('should have a recommendation string', () => {
      const result = service.computeScore('CASE-FULL-001');
      expect(result.recommendation).toBeTruthy();
    });

    it('should have a valid fhcResultId', () => {
      const result = service.computeScore('CASE-FULL-001');
      expect(result.fhcResultId).toMatch(/^FHC-/);
    });

    it('should store the result in the datastore', () => {
      service.computeScore('CASE-FULL-001');
      const stored = mockDataStore.fhcResults.get('CASE-FULL-001');
      expect(stored).toBeDefined();
      expect(stored!.caseId).toBe('CASE-FULL-001');
    });
  });

  describe('computeScore - thin file case (CASE-THIN-001)', () => {
    it('should compute lower overall health than full data case', () => {
      const fullResult = service.computeScore('CASE-FULL-001');
      mockDataStore.reset();
      const thinResult = service.computeScore('CASE-THIN-001');
      expect(thinResult.overallHealth).toBeLessThan(fullResult.overallHealth);
    });

    it('should have lower confidence than full data case', () => {
      const fullResult = service.computeScore('CASE-FULL-001');
      mockDataStore.reset();
      const thinResult = service.computeScore('CASE-THIN-001');
      expect(thinResult.confidence).toBeLessThan(fullResult.confidence);
    });

    it('should have lower completeness than full data case', () => {
      const fullResult = service.computeScore('CASE-FULL-001');
      mockDataStore.reset();
      const thinResult = service.computeScore('CASE-THIN-001');
      expect(thinResult.completeness).toBeLessThan(fullResult.completeness);
    });

    it('should have more missing sources than full data case', () => {
      const thinResult = service.computeScore('CASE-THIN-001');
      expect(thinResult.missingSources.length).toBeGreaterThan(0);
    });
  });

  describe('health band assignment', () => {
    it('should return STRONG for score >= 70', () => {
      const result = service.computeScore('CASE-FULL-001');
      expect(result.overallHealth).toBeGreaterThanOrEqual(70);
      expect(result.healthBand).toBe(HealthBand.STRONG);
    });
  });

  describe('anomaly detection (CASE-REVIEW-001)', () => {
    it('should detect CONSENT_REVOKED anomaly', () => {
      const result = service.computeScore('CASE-REVIEW-001');
      const consentRevoked = result.anomalies.find(a => a.type === 'CONSENT_REVOKED');
      expect(consentRevoked).toBeDefined();
      expect(consentRevoked!.severity).toBe('HIGH');
    });

    it('should detect GST_GAP anomaly', () => {
      const result = service.computeScore('CASE-REVIEW-001');
      const gstGap = result.anomalies.find(a => a.type === 'GST_GAP');
      expect(gstGap).toBeDefined();
      expect(gstGap!.severity).toBe('MEDIUM');
    });
  });

  describe('missing data reduces completeness before health', () => {
    it('should have completeness score that reflects missing sources', () => {
      const fullResult = service.computeScore('CASE-FULL-001');
      mockDataStore.reset();
      const thinResult = service.computeScore('CASE-THIN-001');
      expect(thinResult.completeness).toBeLessThan(fullResult.completeness);
    });
  });

  describe('getFHCResult', () => {
    it('should return undefined for non-existent case', () => {
      const result = service.getFHCResult('NONEXISTENT');
      expect(result).toBeUndefined();
    });

    it('should return stored FHC result', () => {
      service.computeScore('CASE-FULL-001');
      const result = service.getFHCResult('CASE-FULL-001');
      expect(result).toBeDefined();
      expect(result!.caseId).toBe('CASE-FULL-001');
    });
  });

  describe('getPillarScores', () => {
    it('should return empty array for non-existent case', () => {
      const scores = service.getPillarScores('NONEXISTENT');
      expect(scores).toEqual([]);
    });

    it('should return pillar scores for a scored case', () => {
      const scores = service.getPillarScores('CASE-FULL-001');
      expect(scores.length).toBeGreaterThan(0);
    });
  });

  describe('computeScore error handling', () => {
    it('should throw CASE_NOT_FOUND for missing case', () => {
      expect(() => service.computeScore('MISSING-CASE')).toThrow('Case not found');
    });
  });
});
