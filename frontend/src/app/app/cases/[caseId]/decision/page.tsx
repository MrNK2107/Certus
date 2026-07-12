'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CaseDetail {
  caseId: string;
  businessName: string;
}

export default function CreditDecisionPage({ params }: { params: Promise<{ caseId: string }> }) {
  const router = useRouter();
  const [caseId, setCaseId] = useState<string>('');
  const [caseObj, setCaseObj] = useState<CaseDetail | null>(null);
  const [decisionStatus, setDecisionStatus] = useState<'APPROVE' | 'DECLINE' | 'REFER' | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingDecision, setExistingDecision] = useState<{ decisionType: string; decisionReason: string; createdAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setCaseId(p.caseId));
  }, [params]);

  useEffect(() => {
    if (!caseId) return;

    async function fetchCaseAndDecision() {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        // Fetch case details
        const cRes = await fetch(`${baseUrl}/api/v1/cases/${caseId}`, { cache: 'no-store' });
        if (!cRes.ok) {
          setError('Case details not found.');
          setLoading(false);
          return;
        }
        const cJson = await cRes.json();
        setCaseObj(cJson.data);

        // Fetch decision if exists
        const dRes = await fetch(`${baseUrl}/api/v1/decisions/${caseId}`, { cache: 'no-store' });
        if (dRes.ok) {
          const dJson = await dRes.json();
          if (dJson.data) {
            setExistingDecision(dJson.data);
            setDecisionStatus(dJson.data.decisionType);
            setDecisionReason(dJson.data.decisionReason || '');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCaseAndDecision();
  }, [caseId]);

  const submitDecision = async () => {
    if (!decisionStatus) return;
    setSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${baseUrl}/api/v1/decisions/${caseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionType: decisionStatus,
          decisionReason: decisionReason.trim(), // Optional
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setExistingDecision({
          decisionType: decisionStatus,
          decisionReason: decisionReason.trim(),
          createdAt: new Date().toISOString(),
        });
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.message || 'Failed to submit decision.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit decision. Please check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !caseId) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--color-teal-600)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Loading credit decision status...</div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '12px' }}>
        <div style={{ color: 'var(--color-risk-text)', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>{error}</div>
        <button onClick={() => router.push('/app/queue')} style={{ padding: '8px 16px', backgroundColor: 'var(--color-teal-600)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Back to Queue</button>
      </div>
    );
  }

  const businessName = caseObj?.businessName || 'Applicant Business';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      {/* Top Header: Breadcrumbs & CTAs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}>
          <Link href="/app/queue" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Customer Queue</Link>
          <span style={{ color: 'var(--text-tertiary)' }}>/</span>
          <Link href={`/app/cases/${caseId}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{caseId} - {businessName}</Link>
          <span style={{ color: 'var(--text-tertiary)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-semibold)' }}>Credit Decision</span>
        </div>

        <button
          onClick={() => router.push(`/app/cases/${caseId}/explanations`)}
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', cursor: 'pointer' }}
        >
          Previous
        </button>
      </div>

      {/* Underwriter Responsibility Disclaimer Notice */}
      <div style={{ backgroundColor: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1.4rem', marginTop: '-2px' }}>⚠</span>
        <div>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-caution-text)', margin: '0 0 4px' }}>
            Sole Underwriter Responsibility Policy
          </h4>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
            In accordance with IDBI Bank’s credit policy and regulatory guidelines, final credit underwriting decisions are the sole responsibility of the authorized human credit official. Automated risk scores, model flags, and SHAP calculations are advisory reference parameters and do not constitute automated decisions.
          </p>
        </div>
      </div>

      {/* Credit Decision Panel */}
      <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-5)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', margin: 0 }}>Decision Recording Form</h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: '4px', margin: '4px 0 0' }}>
              Select the final underwriting action and optionally document your rationale.
            </p>
          </div>
          {existingDecision && (
            <div style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-bold)',
              backgroundColor: existingDecision.decisionType === 'APPROVE' ? 'rgba(0,131,108,0.1)' : existingDecision.decisionType === 'DECLINE' ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.1)',
              color: existingDecision.decisionType === 'APPROVE' ? 'var(--color-positive-text)' : existingDecision.decisionType === 'DECLINE' ? 'var(--color-risk-text)' : 'var(--color-caution-text)',
              border: `1px solid ${existingDecision.decisionType === 'APPROVE' ? 'rgba(0,131,108,0.3)' : existingDecision.decisionType === 'DECLINE' ? 'rgba(220,38,38,0.3)' : 'rgba(217,119,6,0.3)'}`,
            }}>
              {existingDecision.decisionType === 'APPROVE' ? '✓ Approved' : existingDecision.decisionType === 'DECLINE' ? '✗ Rejected' : '⟳ Refer to Committee'}
            </div>
          )}
        </div>

        {existingDecision && !submitted ? (
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Recorded Decision (Audit Log: {new Date(existingDecision.createdAt).toLocaleString('en-IN')})
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', fontStyle: existingDecision.decisionReason ? 'normal' : 'italic' }}>
              {existingDecision.decisionReason ? `"${existingDecision.decisionReason}"` : "(No rationale documented)"}
            </div>
          </div>
        ) : null}

        {submitted ? (
          <div style={{ backgroundColor: 'rgba(0,131,108,0.06)', border: '1px solid rgba(0,131,108,0.2)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-5)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>✓</div>
            <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-positive-text)', marginBottom: '4px' }}>
              Decision Successfully Submitted
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              {decisionStatus === 'APPROVE' ? 'Case marked as Approved.' : decisionStatus === 'DECLINE' ? 'Case marked as Rejected.' : 'Case referred to Credit Committee.'}
            </div>
            <button
              onClick={() => router.push('/app/queue')}
              style={{ marginTop: '16px', padding: '8px 20px', backgroundColor: 'var(--color-teal-600)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)' }}
            >
              Return to Queue
            </button>
          </div>
        ) : (
          <>
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-5)' }}>
              {([
                { key: 'APPROVE' as const, label: 'Approve', icon: '✓', bg: decisionStatus === 'APPROVE' ? '#00836c' : 'transparent', color: decisionStatus === 'APPROVE' ? '#fff' : 'var(--color-positive-text)', border: '2px solid #00836c' },
                { key: 'DECLINE' as const, label: 'Reject', icon: '✗', bg: decisionStatus === 'DECLINE' ? '#dc2626' : 'transparent', color: decisionStatus === 'DECLINE' ? '#fff' : 'var(--color-risk-text)', border: '2px solid #dc2626' },
                { key: 'REFER' as const, label: 'Refer to Committee', icon: '⟳', bg: decisionStatus === 'REFER' ? '#d97706' : 'transparent', color: decisionStatus === 'REFER' ? '#fff' : 'var(--color-caution-text)', border: '2px solid #d97706' },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setDecisionStatus(opt.key)}
                  style={{
                    padding: 'var(--spacing-3) var(--spacing-5)',
                    borderRadius: 'var(--radius-md)',
                    border: opt.border,
                    backgroundColor: opt.bg,
                    color: opt.color,
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s',
                  }}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Rationale Text Area */}
            <div style={{ marginBottom: 'var(--spacing-5)' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                Decision Rationale <span style={{ color: 'var(--text-tertiary)', fontWeight: 'normal', fontSize: 'var(--font-size-xs)' }}>(Optional)</span>
              </label>
              <textarea
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Document your rationale or findings here (this will be logged in the audit trail)..."
                rows={4}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                {decisionReason.length}/500 characters
              </div>
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--spacing-3)' }}>
              {!decisionStatus && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Select action to submit decision</div>
              )}
              <button
                onClick={submitDecision}
                disabled={!decisionStatus || submitting}
                style={{
                  padding: 'var(--spacing-3) var(--spacing-6)',
                  backgroundColor: !decisionStatus ? 'var(--bg-secondary)' : 'var(--color-teal-600)',
                  color: !decisionStatus ? 'var(--text-tertiary)' : '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  cursor: !decisionStatus ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Recording...' : 'Submit Decision'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
