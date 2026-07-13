import type { AuditEvent } from '../../../../../shared';
import { AuditRow } from '@/components/ui';
import { apiFetchAll } from '@/lib/api';

export default async function AuditPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const events = await apiFetchAll<AuditEvent>(`/audit/events?caseId=${caseId}`);

  if (events.length === 0) {
    return (
      <div>
        <h1>Audit Trail</h1>
        <p>No audit events found.</p>
      </div>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div>
      <h1>Audit Trail</h1>
      {sorted.map((event) => (
        <AuditRow key={event.auditEventId} event={event} />
      ))}
    </div>
  );
}
