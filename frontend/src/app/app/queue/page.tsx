'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatusChip } from '@/components/ui';
import { CaseState, SectorType, DecisionType } from '@msme-credit/shared';

interface QueueItem {
  caseId: string;
  businessName: string;
  sector: SectorType;
  status: CaseState;
  createdAt: string;
  overallHealth?: number;
  decision?: {
    decisionType: DecisionType;
  };
}

export default function QueuePage() {
  const router = useRouter();
  const [cases, setCases] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCompleted, setShowCompleted] = useState(false); // Toggle completed vs others

  useEffect(() => {
    async function fetchCases() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${baseUrl}/api/v1/cases`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          // The response has { requestId, timestamp, data: [...] }
          // We also want to fetch decision status for each completed case if not present
          const casesData = json.data || [];
          
          // Let's attach overallHealth and decision info by fetching case summaries
          const enrichedCases = await Promise.all(
            casesData.map(async (c: any) => {
              try {
                const sRes = await fetch(`${baseUrl}/api/v1/cases/${c.caseId}/summary`, { cache: 'no-store' });
                if (sRes.ok) {
                  const sJson = await sRes.json();
                  const summary = sJson.data || {};
                  
                  // If completed, check if there is a decision
                  let decision = undefined;
                  if (c.status === CaseState.DECISIONED) {
                    const dRes = await fetch(`${baseUrl}/api/v1/decisions/${c.caseId}`, { cache: 'no-store' });
                    if (dRes.ok) {
                      const dJson = await dRes.json();
                      decision = dJson.data;
                    }
                  }

                  return {
                    ...c,
                    overallHealth: summary.overallHealth,
                    decision
                  };
                }
              } catch {
                // Ignore enrich error, return base case
              }
              return c;
            })
          );

          // Filter out the test cases (e.g. CASE-FULL-001) to keep the queue clean for underwriters, 
          // only showing cases starting with CUST000...
          const underwriterCases = enrichedCases.filter((c: any) => c.caseId.startsWith('CUST000'));
          setCases(underwriterCases);
        }
      } catch (err) {
        console.error('Error fetching queue:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, []);

  // Map case state to UI Display Status
  const getDisplayStatus = (status: CaseState): string => {
    switch (status) {
      case CaseState.UNDER_REVIEW:
      case CaseState.SCORED:
        return 'Pending Review';
      case CaseState.DATA_FETCHING:
      case CaseState.SCORING:
      case CaseState.SOURCE_LINKING:
      case CaseState.CONSENT_GRANTED:
        return 'In Progress';
      case CaseState.DECISIONED:
        return 'Completed';
      case CaseState.CONSENT_PENDING:
      case CaseState.DRAFT:
        return 'Requires Action';
      case CaseState.FAILED:
      case CaseState.CONSENT_REVOKED:
      case CaseState.EXPIRED:
      default:
        return 'Failed';
    }
  };

  // Filter cases based on search term, category toggle, and status filter
  const filteredCases = cases.filter((c) => {
    const displayStatus = getDisplayStatus(c.status);
    const isCaseCompleted = displayStatus === 'Completed';

    // 1. Toggle Completed vs others
    if (showCompleted && !isCaseCompleted) return false;
    if (!showCompleted && isCaseCompleted) return false;

    // 2. Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        c.businessName.toLowerCase().includes(term) ||
        c.caseId.toLowerCase().includes(term) ||
        c.sector.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    // 3. Status dropdown filter
    if (statusFilter !== 'ALL' && displayStatus !== statusFilter) {
      return false;
    }

    return true;
  });

  // Calculate metrics
  const totalCount = cases.length;
  const pendingCount = cases.filter(c => getDisplayStatus(c.status) === 'Pending Review').length;
  const inProgressCount = cases.filter(c => getDisplayStatus(c.status) === 'In Progress').length;
  const completedCount = cases.filter(c => getDisplayStatus(c.status) === 'Completed').length;
  const highRiskCount = cases.filter(c => c.overallHealth && c.overallHealth < 50).length;
  const requiresActionCount = cases.filter(c => getDisplayStatus(c.status) === 'Requires Action').length;

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-secondary)' }}>Loading applicant queue...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>Customer Queue</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-1)' }}>
          View and manage all applicants in the queue for assessment and analysis.
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--spacing-3)' }}>
        {[
          { label: 'Total Applicants', val: totalCount, color: 'var(--color-navy-700)', border: '4px solid var(--color-navy-600)', grad: 'linear-gradient(135deg, var(--color-white) 0%, rgba(208, 220, 238, 0.1) 100%)' },
          { label: 'Pending Review', val: pendingCount, color: 'var(--text-primary)', border: '4px solid var(--color-slate-500)', grad: 'linear-gradient(135deg, var(--color-white) 0%, rgba(226, 232, 240, 0.1) 100%)' },
          { label: 'In Progress', val: inProgressCount, color: 'var(--color-info)', border: '4px solid var(--color-blue-500)', grad: 'linear-gradient(135deg, var(--color-white) 0%, rgba(191, 219, 254, 0.1) 100%)' },
          { label: 'Completed', val: completedCount, color: 'var(--color-positive-text)', border: '4px solid var(--color-teal-600)', grad: 'linear-gradient(135deg, var(--color-white) 0%, rgba(224, 245, 240, 0.2) 100%)' },
          { label: 'High Risk', val: highRiskCount, color: 'var(--color-risk-text)', border: '4px solid var(--color-red-600)', grad: 'linear-gradient(135deg, var(--color-white) 0%, rgba(252, 232, 232, 0.2) 100%)' },
          { label: 'Requires Action', val: requiresActionCount, color: 'var(--color-caution-text)', border: '4px solid var(--color-amber-600)', grad: 'linear-gradient(135deg, var(--color-white) 0%, rgba(254, 245, 208, 0.2) 100%)' }
        ].map((m, idx) => (
          <div key={idx} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderTop: m.border, borderRadius: 'var(--radius-md)', padding: 'var(--spacing-4)', textAlign: 'center', background: m.grad, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'var(--font-weight-medium)' }}>{m.label}</div>
            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: m.color, marginTop: 'var(--spacing-1)' }}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Filter and Toggle Header */}
      <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', padding: 'var(--spacing-4) var(--spacing-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-4)' }}>
        {/* Left: Filter Panel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}
          >
            <option value="ALL">All Status</option>
            <option value="Pending Review">Pending Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Requires Action">Requires Action</option>
            <option value="Failed">Failed</option>
          </select>

          {/* Toggle Button for Completed vs Others */}
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button
              onClick={() => { setShowCompleted(false); setStatusFilter('ALL'); }}
              style={{ padding: 'var(--spacing-2) var(--spacing-4)', border: 'none', backgroundColor: !showCompleted ? 'var(--color-teal-600)' : 'var(--bg-secondary)', color: !showCompleted ? 'var(--color-white)' : 'var(--text-primary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', transition: 'all 0.2s' }}
            >
              Active Cases
            </button>
            <button
              onClick={() => { setShowCompleted(true); setStatusFilter('ALL'); }}
              style={{ padding: 'var(--spacing-2) var(--spacing-4)', border: 'none', backgroundColor: showCompleted ? 'var(--color-teal-600)' : 'var(--bg-secondary)', color: showCompleted ? 'var(--color-white)' : 'var(--text-primary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', transition: 'all 0.2s' }}
            >
              Completed Cases
            </button>
          </div>
        </div>

        {/* Right: Search Input */}
        <div style={{ position: 'relative', width: '260px' }}>
          <input
            type="text"
            placeholder="Search applicant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3) var(--spacing-2) var(--spacing-8)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: 'var(--font-size-sm)', outline: 'none' }}
          />
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16" style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabular Queue */}
      <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderTop: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: 'var(--spacing-4) var(--spacing-5)' }}>Customer ID</th>
              <th style={{ padding: 'var(--spacing-4) var(--spacing-5)' }}>Business Name</th>
              <th style={{ padding: 'var(--spacing-4) var(--spacing-5)' }}>Sector</th>
              <th style={{ padding: 'var(--spacing-4) var(--spacing-5)' }}>Submitted On</th>
              <th style={{ padding: 'var(--spacing-4) var(--spacing-5)' }}>Status</th>
              <th style={{ padding: 'var(--spacing-4) var(--spacing-5)' }}>Health Score</th>
              {showCompleted && <th style={{ padding: 'var(--spacing-4) var(--spacing-5)' }}>Underwriter Decision</th>}
              <th style={{ padding: 'var(--spacing-4) var(--spacing-5)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan={showCompleted ? 8 : 7} style={{ padding: 'var(--spacing-8)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  No cases found in this category.
                </td>
              </tr>
            ) : (
              filteredCases.map((c) => {
                const displayStatus = getDisplayStatus(c.status);
                const isCompleted = displayStatus === 'Completed';

                return (
                  <tr 
                    key={c.caseId}
                    onClick={() => router.push(`/app/cases/${c.caseId}`)}
                    style={{ borderBottom: '1px solid var(--border-color)', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}
                    className="queue-row"
                  >
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-5)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-navy-600)' }}>{c.caseId}</td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-5)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{c.businessName}</td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-5)', color: 'var(--text-secondary)' }}>{c.sector}</td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-5)', color: 'var(--text-secondary)' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-5)' }}>
                      <span className={`status-${displayStatus.toLowerCase().replace(/ /g, '-')}`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-5)', fontWeight: 'var(--font-weight-bold)' }}>
                      {isCompleted && c.overallHealth ? (
                        <span style={{ color: c.overallHealth >= 70 ? 'var(--color-positive-text)' : c.overallHealth >= 50 ? 'var(--color-caution-text)' : 'var(--color-risk-text)' }}>
                          {c.overallHealth} <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/100</span>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)' }}>-</span>
                      )}
                    </td>
                    {showCompleted && (
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-5)' }}>
                        {c.decision ? (
                          <span style={{ color: c.decision.decisionType === DecisionType.APPROVE ? 'var(--color-positive-text)' : 'var(--color-risk-text)', fontWeight: 'var(--font-weight-semibold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {c.decision.decisionType === DecisionType.APPROVE ? (
                              <>
                                <svg fill="currentColor" viewBox="0 0 20 20" width="14" height="14">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Approved
                              </>
                            ) : (
                              <>
                                <svg fill="currentColor" viewBox="0 0 20 20" width="14" height="14">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                Declined
                              </>
                            )}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-caution-text)', fontWeight: 'var(--font-weight-medium)' }}>Pending Decision</span>
                        )}
                      </td>
                    )}
                    <td style={{ padding: 'var(--spacing-4) var(--spacing-5)', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)' }}>
                        <button
                          onClick={() => router.push(`/app/cases/${c.caseId}`)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '4px', cursor: 'pointer', transition: 'color 0.2s' }}
                          title="View Raw Details"
                        >
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        {!isCompleted && c.status !== CaseState.FAILED && c.status !== CaseState.CONSENT_PENDING && (
                          <button
                            onClick={() => router.push(`/app/cases/${c.caseId}/pipeline`)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-teal-600)', padding: '4px', cursor: 'pointer', transition: 'color 0.2s' }}
                            title="Run Ingestion Pipeline"
                          >
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Styled badge helpers in page */}
      <style jsx global>{`
        .queue-row:hover {
          background-color: var(--bg-secondary);
        }
        .status-pending-review {
          display: inline-block;
          background-color: var(--color-navy-50);
          color: var(--color-navy-700);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
        }
        .status-in-progress {
          display: inline-block;
          background-color: var(--color-blue-50);
          color: var(--color-blue-600);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
        }
        .status-completed {
          display: inline-block;
          background-color: var(--color-teal-50);
          color: var(--color-teal-600);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
        }
        .status-requires-action {
          display: inline-block;
          background-color: var(--color-amber-50);
          color: var(--color-amber-600);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
        }
        .status-failed {
          display: inline-block;
          background-color: var(--color-red-50);
          color: var(--color-red-600);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
        }
        
        .pipeline-not-started {
          display: inline-block;
          border: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          color: var(--text-secondary);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
        }
        .pipeline-running {
          display: inline-block;
          border: 1px solid var(--color-blue-200);
          background-color: var(--color-blue-50);
          color: var(--color-blue-600);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          animation: pulse 1.5s infinite;
        }
        .pipeline-completed {
          display: inline-block;
          border: 1px solid var(--color-teal-200);
          background-color: var(--color-teal-50);
          color: var(--color-teal-600);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
        }
        .pipeline-failed {
          display: inline-block;
          border: 1px solid var(--color-red-200);
          background-color: var(--color-red-50);
          color: var(--color-red-600);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
        }
        
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
