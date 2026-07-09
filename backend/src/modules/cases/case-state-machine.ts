import { CaseState } from '@msme-credit/shared';

const TRANSITIONS: Map<CaseState, CaseState[]> = new Map([
  [CaseState.DRAFT, [CaseState.CONSENT_PENDING, CaseState.FAILED, CaseState.EXPIRED, CaseState.CONSENT_REVOKED]],
  [CaseState.CONSENT_PENDING, [CaseState.CONSENT_GRANTED, CaseState.FAILED, CaseState.EXPIRED, CaseState.CONSENT_REVOKED]],
  [CaseState.CONSENT_GRANTED, [CaseState.SOURCE_LINKING, CaseState.FAILED, CaseState.CONSENT_REVOKED]],
  [CaseState.SOURCE_LINKING, [CaseState.DATA_FETCHING, CaseState.FAILED, CaseState.CONSENT_REVOKED]],
  [CaseState.DATA_FETCHING, [CaseState.DATA_READY, CaseState.FAILED, CaseState.CONSENT_REVOKED]],
  [CaseState.DATA_READY, [CaseState.SCORING, CaseState.FAILED, CaseState.CONSENT_REVOKED]],
  [CaseState.SCORING, [CaseState.SCORED, CaseState.FAILED]],
  [CaseState.SCORED, [CaseState.UNDER_REVIEW, CaseState.FAILED]],
  [CaseState.UNDER_REVIEW, [CaseState.DECISIONED, CaseState.FAILED]],
  [CaseState.DECISIONED, []],
  [CaseState.CONSENT_REVOKED, []],
  [CaseState.EXPIRED, []],
  [CaseState.FAILED, []],
]);

const TERMINAL_STATES = new Set<CaseState>([
  CaseState.DECISIONED,
  CaseState.CONSENT_REVOKED,
  CaseState.EXPIRED,
  CaseState.FAILED,
]);

export class CaseStateMachine {
  canTransition(from: CaseState, to: CaseState): boolean {
    const allowed = TRANSITIONS.get(from);
    if (!allowed) return false;
    return allowed.includes(to);
  }

  transition(from: CaseState, to: CaseState): CaseState {
    if (!this.canTransition(from, to)) {
      throw Object.assign(
        new Error(`Cannot transition from ${from} to ${to}`),
        { statusCode: 400, code: 'INVALID_TRANSITION', details: { from, to } }
      );
    }
    return to;
  }

  getAllowedNextStates(state: CaseState): CaseState[] {
    return TRANSITIONS.get(state) || [];
  }

  isTerminal(state: CaseState): boolean {
    return TERMINAL_STATES.has(state);
  }
}

export const caseStateMachine = new CaseStateMachine();
