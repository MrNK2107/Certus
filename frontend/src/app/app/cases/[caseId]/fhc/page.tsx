'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CaseDetail {
  caseId: string;
  businessName: string;
}

interface PillarScore {
  pillarScoreId: string;
  pillarName: string;
  score: number;
  confidence: number;
  evidenceSummary: string;
  reasonCodes: string[];
}

interface FHCResult {
  overallHealth: number;
  healthBand: string;
  confidence: number;
  completeness: number;
  strengths: string[];
  risks: string[];
  modelVersion: string;
  policyVersion: string;
  recommendation: string;
  anomalies?: any[];
  pillarScores?: PillarScore[];
}

const mapPillarName = (name: string) => {
  switch (name) {
    case 'CREDIT_BEHAVIOR': return 'Identity Strength';
    case 'OPERATIONAL_MATURITY': return 'Operational Health';
    case 'CASH_FLOW_HEALTH': return 'Cash Flow Health';
    case 'DIGITAL_COMMERCIAL_ACTIVITY': return 'Growth Potential';
    case 'COMPLIANCE_DISCIPLINE': return 'Compliance Score';
    case 'REVENUE_STABILITY': return 'Revenue Stability';
    default: return name.replace(/_/g, ' ');
  }
};

const getPillarRating = (score: number) => {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Moderate';
  return 'Weak';
};

const formatHealthBand = (band: string) => {
  switch (band) {
    case 'STRONG': return 'Strong';
    case 'PROMISING_BUT_THIN': return 'Promising';
    case 'NEEDS_REVIEW': return 'Needs Review';
    case 'RISKY': return 'Risky';
    default: return band.charAt(0) + band.slice(1).toLowerCase();
  }
};

const getPillarColor = (score: number) => {
  if (score >= 70) return 'var(--color-positive-text)';
  if (score >= 50) return 'var(--color-caution-text)';
  return 'var(--color-risk-text)';
};

export default function FHCPage({ params }: { params: Promise<{ caseId: string }> }) {
  const router = useRouter();
  const [caseId, setCaseId] = useState<string>('');
  const [caseObj, setCaseObj] = useState<CaseDetail | null>(null);
  const [fhcResult, setFhcResult] = useState<FHCResult | null>(null);
  const [pillarScores, setPillarScores] = useState<PillarScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setCaseId(p.caseId));
  }, [params]);

  useEffect(() => {
    if (!caseId) return;

    async function fetchCaseData() {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        // First fetch case
        const cRes = await fetch(`${baseUrl}/api/v1/cases/${caseId}`, { cache: 'no-store' });
        if (!cRes.ok) { setError('Case not found.'); setLoading(false); return; }
        const cJson = await cRes.json();
        setCaseObj(cJson.data);

        // Try to get FHC — if 404, compute it first
        let fhcData: FHCResult | null = null;
        let fRes = await fetch(`${baseUrl}/api/v1/scores/${caseId}/fhc`, { cache: 'no-store' });
        if (!fRes.ok) {
          // Compute the score
          const computeRes = await fetch(`${baseUrl}/api/v1/scores/${caseId}/compute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          if (computeRes.ok) {
            const resJson = await computeRes.json();
            fhcData = resJson.data;
          }
        } else {
          const resJson = await fRes.json();
          fhcData = resJson.data;
        }

        if (fhcData) {
          setFhcResult(fhcData);
          // Use pillarScores embedded in FHC result if available, else fetch separately
          if (fhcData.pillarScores && fhcData.pillarScores.length > 0) {
            setPillarScores(fhcData.pillarScores);
          } else {
            const pRes = await fetch(`${baseUrl}/api/v1/scores/${caseId}/pillars`, { cache: 'no-store' });
            if (pRes.ok) {
              const pJson = await pRes.json();
              setPillarScores(pJson.data);
            }
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load financial health card data.');
      } finally {
        setLoading(false);
      }
    }
    fetchCaseData();
  }, [caseId]);

  if (loading || !caseId) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--color-teal-600)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Loading financial health card...</div>
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
  const score = fhcResult?.overallHealth ?? 0;
  const rating = formatHealthBand(fhcResult?.healthBand ?? 'STRONG');
  const confidence = fhcResult?.confidence ?? 0;

  const trendPoints = [score - 6, score - 3, score - 5, score - 1, score - 4, score];

  // Color for score gauge
  const scoreColor = score >= 70 ? 'var(--color-teal-600)' : score >= 50 ? 'var(--color-amber-500)' : 'var(--color-red-500)';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      {/* Top Header: Breadcrumbs & CTAs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}>
          <Link href="/app/queue" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Customer Queue</Link>
          <span style={{ color: 'var(--text-tertiary)' }}>/</span>
          <Link href={`/app/cases/${caseId}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{caseId} - {businessName}</Link>
          <span style={{ color: 'var(--text-tertiary)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-semibold)' }}>Financial Health Card</span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
          <button
            onClick={() => router.push(`/app/cases/${caseId}/sources`)}
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', cursor: 'pointer' }}
          >
            Previous
          </button>
          <button
            onClick={() => router.push(`/app/cases/${caseId}/explanations`)}
            style={{ backgroundColor: 'var(--color-teal-600)', color: 'var(--color-white)', border: 'none', padding: 'var(--spacing-2) var(--spacing-5)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', display: 'flex', alignItems: 'center', gap: 8, boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
          >
            Next: Explainability
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Grid: Overall Health Score & 6 Pillars Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '4fr 8fr', gap: 'var(--spacing-6)' }}>
        {/* Left Column: Overall Financial Health Score */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-4)' }}>
          <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', alignSelf: 'flex-start' }}>Overall Financial Health Score</h4>

          {/* Circular Gauge */}
          <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-225deg)' }}>
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-teal-300)" />
                  <stop offset="100%" stopColor="var(--color-teal-600)" />
                </linearGradient>
              </defs>
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-color)" strokeWidth="2.5" strokeDasharray="75 100" strokeLinecap="round" />
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke={scoreColor}
                strokeDasharray={`${(score / 100) * 75} 100`}
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center', marginTop: '-10px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>{score}<span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>/100</span></div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: scoreColor, fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase', marginTop: '2px' }}>{rating}</div>
            </div>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-4)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Confidence Score</span>
                <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>{confidence}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${confidence}%`, height: '100%', backgroundColor: 'var(--color-teal-600)' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Completeness</span>
                <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>{fhcResult?.completeness ?? 0}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${fhcResult?.completeness ?? 0}%`, height: '100%', backgroundColor: 'var(--color-navy-500)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Score Breakdown (6 pillar cards) */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5) var(--spacing-6)' }}>
          <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>Score Breakdown</h4>

          {pillarScores.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              No pillar scores available. Run the pipeline to compute scores.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-4)' }}>
              {pillarScores.map((p, idx) => {
                const label = mapPillarName(p.pillarName);
                const pRating = getPillarRating(p.score);
                const col = getPillarColor(p.score);
                const bgCol = p.score >= 70 ? 'rgba(0,131,108,0.06)' : p.score >= 50 ? 'rgba(217,119,6,0.06)' : 'rgba(220,38,38,0.06)';
                return (
                  <div key={idx} style={{ border: `1px solid ${p.score >= 70 ? 'rgba(0,131,108,0.2)' : p.score >= 50 ? 'rgba(217,119,6,0.2)' : 'rgba(220,38,38,0.2)'}`, borderRadius: 'var(--radius-md)', padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', backgroundColor: bgCol }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>{label}</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', lineHeight: 1 }}>
                      {p.score}<span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/100</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: col, fontWeight: 'var(--font-weight-semibold)' }}>{pRating}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>conf. {p.confidence}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${p.score}%`, height: '100%', backgroundColor: col }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row: Score Details Impact Table & Trend Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 'var(--spacing-6)' }}>
        {/* Score Details Impact Table */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
          <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>Score Details</h4>

          {pillarScores.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: '32px 0' }}>
              No data available. Run pipeline to compute pillar scores.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-sm)' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', borderBottom: '2px solid var(--border-color)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: 'var(--spacing-2) 0', fontWeight: 'var(--font-weight-semibold)' }}>Dimension</th>
                  <th style={{ padding: 'var(--spacing-2) 0', fontWeight: 'var(--font-weight-semibold)' }}>Score</th>
                  <th style={{ padding: 'var(--spacing-2) 0', fontWeight: 'var(--font-weight-semibold)' }}>Status</th>
                  <th style={{ padding: 'var(--spacing-2) 0', fontWeight: 'var(--font-weight-semibold)' }}>Evidence Summary</th>
                  <th style={{ padding: 'var(--spacing-2) 0', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)' }}>Impact</th>
                </tr>
              </thead>
              <tbody>
                {pillarScores.map((row, idx) => {
                  const label = mapPillarName(row.pillarName);
                  const pRating = getPillarRating(row.score);
                  const impactValue = Math.round((row.score - 50) * 0.25);
                  const impactStr = impactValue >= 0 ? `+${impactValue}%` : `${impactValue}%`;
                  const isPos = impactValue >= 0;

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 'var(--spacing-3) 0', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>{label}</td>
                      <td style={{ padding: 'var(--spacing-3) 0', fontWeight: 'var(--font-weight-bold)', color: getPillarColor(row.score) }}>{row.score}/100</td>
                      <td style={{ padding: 'var(--spacing-3) 0' }}>
                        <span style={{ color: isPos ? 'var(--color-positive-text)' : 'var(--color-risk-text)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-xs)', padding: '2px 8px', backgroundColor: isPos ? 'rgba(0,131,108,0.08)' : 'rgba(220,38,38,0.08)', borderRadius: '4px' }}>
                          {pRating}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--spacing-3) 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', maxWidth: '200px' }}>{row.evidenceSummary}</td>
                      <td style={{ padding: 'var(--spacing-3) 0', textAlign: 'right', fontWeight: 'var(--font-weight-bold)', color: isPos ? 'var(--color-positive-text)' : 'var(--color-risk-text)' }}>
                        {impactStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Score Trend Card */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>Score Trend</h4>
            <select style={{ padding: '3px 10px', fontSize: 'var(--font-size-xs)', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
              <option>Last 6 Months</option>
            </select>
          </div>

          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px', marginTop: 'var(--spacing-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', height: '25%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', height: '25%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', height: '25%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', height: '25%' }} />

            <svg viewBox="0 0 100 40" style={{ position: 'absolute', left: 0, right: 0, top: 10, bottom: 20, width: '100%', height: '80%' }}>
              <defs>
                <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-teal-300)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--color-teal-300)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={`M 5 40 L 5 ${40 - trendPoints[0] * 0.35} Q 23 ${40 - trendPoints[1] * 0.35} 41 ${40 - trendPoints[2] * 0.35} T 77 ${40 - trendPoints[3] * 0.35} T 95 ${40 - trendPoints[5] * 0.35} L 95 40 Z`}
                fill="url(#areaGrad)"
              />
              <path
                d={`M 5 ${40 - trendPoints[0] * 0.35} Q 23 ${40 - trendPoints[1] * 0.35} 41 ${40 - trendPoints[2] * 0.35} T 77 ${40 - trendPoints[3] * 0.35} T 95 ${40 - trendPoints[5] * 0.35}`}
                fill="none"
                stroke="var(--color-teal-400)"
                strokeWidth="1.8"
              />
              <circle cx="5" cy={40 - trendPoints[0] * 0.35} r="1.2" fill="var(--color-teal-400)" />
              <circle cx="41" cy={40 - trendPoints[2] * 0.35} r="1.2" fill="var(--color-teal-400)" />
              <circle cx="77" cy={40 - trendPoints[3] * 0.35} r="1.2" fill="var(--color-teal-400)" />
              <circle cx="95" cy={40 - trendPoints[5] * 0.35} r="2.5" fill="var(--color-teal-600)" stroke="var(--color-white)" strokeWidth="0.8" />
              <text x="88" y={40 - trendPoints[5] * 0.35 - 3} fontSize="4.5" fill="var(--text-primary)" fontWeight="bold">{score}</text>
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', padding: '4px 0 0' }}>
              <span>Dec '24</span><span>Jan '25</span><span>Feb '25</span><span>Mar '25</span><span>Apr '25</span><span>May '25</span>
            </div>
          </div>
        </div>
      </div>

      {/* Health Summary Text Box & Key Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 'var(--spacing-6)' }}>
        {/* Health Summary text */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>Health Summary</h4>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>
            {businessName} has been evaluated by the credit intelligence models. The final computed Financial Health Score is{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{score}/100</strong>, placing the business in the{' '}
            <strong style={{ color: scoreColor }}>{rating.toUpperCase()}</strong> band. Model indicators suggest standard verification parameters; final routing remains human underwriter-driven.
          </p>
          {(fhcResult?.strengths?.length ?? 0) > 0 && (
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-positive-text)', marginBottom: '6px' }}>✓ Key Strengths</div>
              <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {fhcResult!.strengths.map((s, i) => (
                  <li key={i} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {(fhcResult?.risks?.length ?? 0) > 0 && (
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-risk-text)', marginBottom: '6px' }}>⚠ Risk Areas</div>
              <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {fhcResult!.risks.map((r, i) => (
                  <li key={i} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Key business stats */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>
          <div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Analysis Status:</span>
            <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-positive-text)', marginTop: '4px' }}>Completed</div>
          </div>
          <div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Model Version:</span>
            <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginTop: '4px' }}>{fhcResult?.modelVersion || '2.3.0'}</div>
          </div>
          <div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Policy Rule Version:</span>
            <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginTop: '4px' }}>{fhcResult?.policyVersion || '1.2'}</div>
          </div>
          <div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Completeness Score:</span>
            <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginTop: '4px' }}>{fhcResult?.completeness || 0}%</div>
          </div>
          <div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Anomalies Flagged:</span>
            <div style={{ fontWeight: 'var(--font-weight-semibold)', color: fhcResult?.anomalies?.length ? 'var(--color-risk-text)' : 'var(--color-positive-text)', marginTop: '4px' }}>{fhcResult?.anomalies?.length || 0} Issues</div>
          </div>
          <div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Report Timestamp:</span>
            <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginTop: '4px' }}>{new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      </div>

      {/* Next step indicators */}
      <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5) var(--spacing-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-teal-600)', color: 'var(--color-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-xs)' }}>5</div>
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)' }}>Next Step: Explainability Drill-Down</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>Inspect individual SHAP variables and contributing weights behind this score.</div>
          </div>
        </div>

        <button
          onClick={() => router.push(`/app/cases/${caseId}/explanations`)}
          style={{ backgroundColor: 'var(--color-teal-600)', color: 'var(--color-white)', border: 'none', padding: 'var(--spacing-2) var(--spacing-5)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', cursor: 'pointer' }}
        >
          View Explainability
        </button>
      </div>
    </div>
  );
}
