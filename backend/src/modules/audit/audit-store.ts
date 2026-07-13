import { AuditEvent, AuditActionType, AccessLog } from '../../shared';
import { mockDataStore } from '../../data/mock-data';

export class AuditStore {
  addEvent(event: AuditEvent): AuditEvent {
    mockDataStore.auditEvents.set(event.auditEventId, event);
    return event;
  }

  findById(eventId: string): AuditEvent | undefined {
    return mockDataStore.auditEvents.get(eventId);
  }

  findByCase(caseId: string): AuditEvent[] {
    return Array.from(mockDataStore.auditEvents.values())
      .filter(e => e.caseId === caseId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  findByActor(actor: string): AuditEvent[] {
    return Array.from(mockDataStore.auditEvents.values())
      .filter(e => e.actor === actor)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  findByAction(action: AuditActionType): AuditEvent[] {
    return Array.from(mockDataStore.auditEvents.values())
      .filter(e => e.action === action)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  findByDateRange(dateFrom: string, dateTo: string): AuditEvent[] {
    return Array.from(mockDataStore.auditEvents.values())
      .filter(e => e.timestamp >= dateFrom && e.timestamp <= dateTo)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  findAll(): AuditEvent[] {
    return Array.from(mockDataStore.auditEvents.values())
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  addAccessLog(log: AccessLog): AccessLog {
    mockDataStore.accessLogs.set(log.accessLogId, log);
    return log;
  }

  getAccessLogs(caseId?: string): AccessLog[] {
    const logs = Array.from(mockDataStore.accessLogs.values());
    if (caseId) {
      return logs.filter(l => l.caseId === caseId).sort((a, b) => a.accessedAt.localeCompare(b.accessedAt));
    }
    return logs.sort((a, b) => a.accessedAt.localeCompare(b.accessedAt));
  }
}

export const auditStore = new AuditStore();
