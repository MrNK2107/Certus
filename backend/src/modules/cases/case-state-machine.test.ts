import { describe, it, expect } from 'vitest';
import { CaseState } from '@msme-credit/shared';
import { CaseStateMachine } from './case-state-machine';

describe('CaseStateMachine', () => {
  const machine = new CaseStateMachine();

  describe('valid transitions', () => {
    it.each([
      [CaseState.DRAFT, CaseState.CONSENT_PENDING],
      [CaseState.DRAFT, CaseState.FAILED],
      [CaseState.DRAFT, CaseState.EXPIRED],
      [CaseState.DRAFT, CaseState.CONSENT_REVOKED],
      [CaseState.CONSENT_PENDING, CaseState.CONSENT_GRANTED],
      [CaseState.CONSENT_PENDING, CaseState.FAILED],
      [CaseState.CONSENT_PENDING, CaseState.EXPIRED],
      [CaseState.CONSENT_PENDING, CaseState.CONSENT_REVOKED],
      [CaseState.CONSENT_GRANTED, CaseState.SOURCE_LINKING],
      [CaseState.CONSENT_GRANTED, CaseState.FAILED],
      [CaseState.CONSENT_GRANTED, CaseState.CONSENT_REVOKED],
      [CaseState.SOURCE_LINKING, CaseState.DATA_FETCHING],
      [CaseState.SOURCE_LINKING, CaseState.FAILED],
      [CaseState.SOURCE_LINKING, CaseState.CONSENT_REVOKED],
      [CaseState.DATA_FETCHING, CaseState.DATA_READY],
      [CaseState.DATA_FETCHING, CaseState.FAILED],
      [CaseState.DATA_FETCHING, CaseState.CONSENT_REVOKED],
      [CaseState.DATA_READY, CaseState.SCORING],
      [CaseState.DATA_READY, CaseState.FAILED],
      [CaseState.DATA_READY, CaseState.CONSENT_REVOKED],
      [CaseState.SCORING, CaseState.SCORED],
      [CaseState.SCORING, CaseState.FAILED],
      [CaseState.SCORED, CaseState.UNDER_REVIEW],
      [CaseState.SCORED, CaseState.FAILED],
      [CaseState.UNDER_REVIEW, CaseState.DECISIONED],
      [CaseState.UNDER_REVIEW, CaseState.FAILED],
    ])('should allow transition from %s to %s', (from, to) => {
      expect(machine.canTransition(from, to)).toBe(true);
    });
  });

  describe('invalid transitions', () => {
    it.each([
      [CaseState.SCORED, CaseState.DRAFT],
      [CaseState.SCORED, CaseState.CONSENT_PENDING],
      [CaseState.DECISIONED, CaseState.DRAFT],
      [CaseState.DECISIONED, CaseState.UNDER_REVIEW],
      [CaseState.DRAFT, CaseState.UNDER_REVIEW],
      [CaseState.DRAFT, CaseState.DECISIONED],
      [CaseState.CONSENT_PENDING, CaseState.DATA_READY],
      [CaseState.CONSENT_GRANTED, CaseState.DRAFT],
      [CaseState.DATA_READY, CaseState.CONSENT_PENDING],
    ])('should reject transition from %s to %s', (from, to) => {
      expect(machine.canTransition(from, to)).toBe(false);
    });
  });

  describe('transition method', () => {
    it('should return the target state for valid transitions', () => {
      const result = machine.transition(CaseState.DRAFT, CaseState.CONSENT_PENDING);
      expect(result).toBe(CaseState.CONSENT_PENDING);
    });

    it('should throw INVALID_TRANSITION error for invalid transitions', () => {
      expect(() => machine.transition(CaseState.SCORED, CaseState.DRAFT)).toThrow(
        'Cannot transition from SCORED to DRAFT'
      );
    });

    it('should include statusCode and code in transition error', () => {
      try {
        machine.transition(CaseState.SCORED, CaseState.DRAFT);
      } catch (e: unknown) {
        const err = e as Record<string, unknown>;
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('INVALID_TRANSITION');
      }
    });
  });

  describe('getAllowedNextStates', () => {
    it('should return all transitions from DRAFT', () => {
      const next = machine.getAllowedNextStates(CaseState.DRAFT);
      expect(next).toContain(CaseState.CONSENT_PENDING);
      expect(next).toContain(CaseState.FAILED);
      expect(next).toContain(CaseState.EXPIRED);
      expect(next).toContain(CaseState.CONSENT_REVOKED);
      expect(next).toHaveLength(4);
    });

    it('should return empty array for DECISIONED', () => {
      const next = machine.getAllowedNextStates(CaseState.DECISIONED);
      expect(next).toHaveLength(0);
    });

    it('should return 3 transitions for DATA_FETCHING', () => {
      const next = machine.getAllowedNextStates(CaseState.DATA_FETCHING);
      expect(next).toHaveLength(3);
      expect(next).toContain(CaseState.DATA_READY);
      expect(next).toContain(CaseState.FAILED);
      expect(next).toContain(CaseState.CONSENT_REVOKED);
    });
  });

  describe('terminal states', () => {
    it.each([
      CaseState.DECISIONED,
      CaseState.CONSENT_REVOKED,
      CaseState.EXPIRED,
      CaseState.FAILED,
    ])('should identify %s as terminal', (state) => {
      expect(machine.isTerminal(state)).toBe(true);
    });

    it.each([
      CaseState.DRAFT,
      CaseState.CONSENT_PENDING,
      CaseState.CONSENT_GRANTED,
      CaseState.SOURCE_LINKING,
      CaseState.DATA_FETCHING,
      CaseState.DATA_READY,
      CaseState.SCORING,
      CaseState.SCORED,
      CaseState.UNDER_REVIEW,
    ])('should NOT identify %s as terminal', (state) => {
      expect(machine.isTerminal(state)).toBe(false);
    });
  });

  describe('terminal states reject further transitions', () => {
    it.each([
      CaseState.DECISIONED,
      CaseState.CONSENT_REVOKED,
      CaseState.EXPIRED,
      CaseState.FAILED,
    ])('should reject any transition from %s', (state) => {
      expect(machine.canTransition(state, CaseState.DRAFT)).toBe(false);
      expect(machine.canTransition(state, CaseState.SCORING)).toBe(false);
    });
  });

  describe('late events on terminal cases', () => {
    it.each([
      CaseState.DECISIONED,
      CaseState.CONSENT_REVOKED,
      CaseState.EXPIRED,
      CaseState.FAILED,
    ])('should throw error when transitioning from terminal state %s', (state) => {
      expect(() => machine.transition(state, CaseState.DRAFT)).toThrow();
    });
  });
});
