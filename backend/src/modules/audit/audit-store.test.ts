import { describe, it, expect, beforeEach } from 'vitest';
import { AuditActionType } from '@msme-credit/shared';
import { AuditStore } from './audit-store';
import { mockDataStore } from '../../data/mock-data';

describe('AuditStore', () => {
  let store: AuditStore;

  beforeEach(() => {
    mockDataStore.reset();
    store = new AuditStore();
  });

  describe('addEvent', () => {
    it('should store a new audit event', () => {
      const event = {
        auditEventId: 'AUD-NEW-001',
        caseId: 'CASE-FULL-001',
        actor: 'tester',
        action: AuditActionType.NOTE_ADDED,
        objectType: 'Case',
        objectId: 'CASE-FULL-001',
        timestamp: new Date().toISOString(),
        requestId: 'req-test-001',
        versionContext: {},
      };
      const stored = store.addEvent(event);
      expect(stored).toEqual(event);
      expect(store.findById('AUD-NEW-001')).toEqual(event);
    });
  });

  describe('findById', () => {
    it('should return undefined for non-existent event', () => {
      const result = store.findById('NONEXISTENT');
      expect(result).toBeUndefined();
    });

    it('should return the correct event', () => {
      const event = store.findById('AUD-FULL-001');
      expect(event).toBeDefined();
      expect(event!.auditEventId).toBe('AUD-FULL-001');
      expect(event!.caseId).toBe('CASE-FULL-001');
    });
  });

  describe('findAll', () => {
    it('should return all audit events sorted by timestamp', () => {
      const all = store.findAll();
      expect(all.length).toBeGreaterThanOrEqual(14);
      for (let i = 1; i < all.length; i++) {
        expect(all[i - 1].timestamp.localeCompare(all[i].timestamp)).toBeLessThanOrEqual(0);
      }
    });

    it('should return events in chronological order', () => {
      const all = store.findAll();
      expect(all.length).toBeGreaterThanOrEqual(130);
      for (let i = 1; i < all.length; i++) {
        expect(all[i - 1].timestamp.localeCompare(all[i].timestamp)).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('findByCase', () => {
    it('should filter events by caseId', () => {
      const events = store.findByCase('CASE-FULL-001');
      expect(events.length).toBeGreaterThanOrEqual(5);
      for (const e of events) {
        expect(e.caseId).toBe('CASE-FULL-001');
      }
    });

    it('should return empty array for unknown case', () => {
      const events = store.findByCase('UNKNOWN');
      expect(events).toEqual([]);
    });

    it('should return events sorted by timestamp', () => {
      const events = store.findByCase('CASE-FULL-001');
      for (let i = 1; i < events.length; i++) {
        expect(events[i - 1].timestamp.localeCompare(events[i].timestamp)).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('findByActor', () => {
    it('should filter events by actor', () => {
      const events = store.findByActor('System');
      expect(events.length).toBeGreaterThanOrEqual(8);
      for (const e of events) {
        expect(e.actor).toBe('System');
      }
    });

    it('should return empty array for unknown actor', () => {
      const events = store.findByActor('Unknown');
      expect(events).toEqual([]);
    });
  });

  describe('findByAction', () => {
    it('should filter events by action type', () => {
      const events = store.findByAction(AuditActionType.CASE_CREATED);
      expect(events.length).toBeGreaterThanOrEqual(5);
      for (const e of events) {
        expect(e.action).toBe(AuditActionType.CASE_CREATED);
      }
    });

    it('should return empty array for unused action', () => {
      const events = store.findByAction(AuditActionType.MODEL_ROLLED_BACK);
      expect(events).toEqual([]);
    });
  });

  describe('findByDateRange', () => {
    it('should filter events within date range', () => {
      const events = store.findByDateRange('2026-07-10T00:00:00Z', '2026-07-10T23:59:59Z');
      expect(events.length).toBeGreaterThanOrEqual(5);
      for (const e of events) {
        expect(e.timestamp >= '2026-07-10T00:00:00Z').toBe(true);
        expect(e.timestamp <= '2026-07-10T23:59:59Z').toBe(true);
      }
    });

    it('should return empty array for non-overlapping range', () => {
      const events = store.findByDateRange('2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z');
      expect(events).toEqual([]);
    });
  });

  describe('access logs', () => {
    it('should add access logs', () => {
      const log = {
        accessLogId: 'LOG-NEW-001',
        caseId: 'CASE-FULL-001',
        accessedBy: 'tester@bank.com',
        accessedAt: new Date().toISOString(),
        action: 'VIEW_CASE',
        reason: 'Testing',
      };
      const stored = store.addAccessLog(log);
      expect(stored).toEqual(log);
    });

    it('should get all access logs', () => {
      store.addAccessLog({
        accessLogId: 'LOG-NEW-001',
        caseId: 'CASE-FULL-001',
        accessedBy: 'tester@bank.com',
        accessedAt: new Date().toISOString(),
        action: 'VIEW_CASE',
      });
      const logs = store.getAccessLogs();
      expect(logs.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter access logs by caseId', () => {
      store.addAccessLog({
        accessLogId: 'LOG-FILTER-001',
        caseId: 'CASE-FULL-001',
        accessedBy: 'tester@bank.com',
        accessedAt: new Date().toISOString(),
        action: 'VIEW_CASE',
      });
      const logs = store.getAccessLogs('CASE-FULL-001');
      expect(logs.length).toBeGreaterThanOrEqual(1);
      for (const l of logs) {
        expect(l.caseId).toBe('CASE-FULL-001');
      }
    });
  });
});
