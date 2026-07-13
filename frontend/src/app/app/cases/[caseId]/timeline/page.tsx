import type { AuditEvent } from '../../../../../shared';
import { TimelineEvent } from '@/components/ui';
import { apiFetchAll } from '@/lib/api';

function eventVariant(event: AuditEvent): 'info' | 'success' | 'warning' | 'error' {
  const action = event.action;
  if (action.includes('FAILED') || action.includes('REVOKED')) return 'error';
  if (action.includes('COMPLETED') || action.includes('GRANTED') || action === 'DECISION_MADE') return 'success';
  if (action.includes('PENDING') || action.includes('CHANGED') || action.includes('UPDATED')) return 'warning';
  return 'info';
}

function formatDetail(event: AuditEvent): string {
  const parts: string[] = [];
  if (event.beforeState && Object.keys(event.beforeState).length > 0) {
    parts.push(`Before: ${JSON.stringify(event.beforeState)}`);
  }
  if (event.afterState && Object.keys(event.afterState).length > 0) {
    parts.push(`After: ${JSON.stringify(event.afterState)}`);
  }
  if (event.metadata && Object.keys(event.metadata).length > 0) {
    parts.push(JSON.stringify(event.metadata));
  }
  return parts.join(' | ');
}

export default async function TimelinePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const events = await apiFetchAll<AuditEvent>(`/audit/events?caseId=${caseId}`);

  if (events.length === 0) {
    return (
      <div>
        <h1>Case Timeline</h1>
        <p>No timeline events found.</p>
      </div>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div>
      <h1>Case Timeline</h1>
      <div>
        {sorted.map((event) => (
          <TimelineEvent
            key={event.auditEventId}
            title={`${event.actor} — ${event.action.replace(/_/g, ' ')}`}
            timestamp={event.timestamp}
            variant={eventVariant(event)}
            description={`${event.objectType}/${event.objectId}${formatDetail(event) ? `: ${formatDetail(event)}` : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
