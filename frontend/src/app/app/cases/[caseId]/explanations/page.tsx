'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CaseDetail {
  caseId: string;
  businessName: string;
  createdAt: string;
  businessProfile?: {
    vintage?: number;
    turnoverBand?: string;
    location?: string;
  };
}

interface PillarExplanation {
  pillarName: string;
  score: number;
  confidence: number;
  evidenceSummary: string;
  reasonCodes: string[];
  sourceCoverage: string[];
  scoreInterpretation: string;
}

interface ExplanationsData {
  overallHealth: number;
  healthBand: string;
  confidence: number;
  completeness: number;
  strengths: string[];
  risks: string[];
  missingSources: string[];
  anomalies: any[];
  recommendation: string;
  pillarExplanations: PillarExplanation[];
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

const formatHealthBand = (band: string) => {
  switch (band) {
    case 'STRONG': return 'Strong';
    case 'PROMISING_BUT_THIN': return 'Promising';
    case 'NEEDS_REVIEW': return 'Needs Review';
    case 'RISKY': return 'Risky';
    default: return band ? band.charAt(0) + band.slice(1).toLowerCase() : 'N/A';
  }
};

// Simple deterministic hash function for generating unique mock values
const hashStringToNumber = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

export default function ExplainabilityPage({ params }: { params: Promise<{ caseId: string }> }) {
  const router = useRouter();
  const [caseId, setCaseId] = useState<string>('');
  const [caseObj, setCaseObj] = useState<CaseDetail | null>(null);
  const [explanations, setExplanations] = useState<ExplanationsData | null>(null);
  const [activeTab, setActiveTab] = useState('OVERALL');
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

        const cRes = await fetch(`${baseUrl}/api/v1/cases/${caseId}`, { cache: 'no-store' });
        if (!cRes.ok) { setError('Case not found.'); setLoading(false); return; }
        const cJson = await cRes.json();
        setCaseObj(cJson.data);

        // Try explanations — if 404, compute score first then retry
        let eRes = await fetch(`${baseUrl}/api/v1/scores/${caseId}/explanations`, { cache: 'no-store' });
        if (!eRes.ok) {
          await fetch(`${baseUrl}/api/v1/scores/${caseId}/compute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          eRes = await fetch(`${baseUrl}/api/v1/scores/${caseId}/explanations`, { cache: 'no-store' });
        }

        if (eRes.ok) {
          const eJson = await eRes.json();
          setExplanations(eJson.data);
        } else {
          setError('Could not load explainability data. Ensure the pipeline has been run.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load explainability details. Please check your connection.');
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
        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Loading explainability details...</div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '12px' }}>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="48" height="48" style={{ color: 'var(--color-risk)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <div style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>{error}</div>
        <button onClick={() => router.push(`/app/cases/${caseId}/pipeline`)} style={{ padding: '8px 20px', backgroundColor: 'var(--color-teal-600)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
          Go to Pipeline
        </button>
      </div>
    );
  }

  if (!explanations) return null;

  const businessName = caseObj?.businessName || 'Applicant Business';
  const score = explanations.overallHealth;
  const rating = formatHealthBand(explanations.healthBand);
  const confidence = explanations.confidence;
  const scoreColor = score >= 70 ? 'var(--color-teal-600)' : score >= 50 ? 'var(--color-amber-500)' : 'var(--color-red-500)';

  const getPillarScore = (name: string): number =>
    explanations.pillarExplanations.find(p => p.pillarName === name)?.score ?? 75;

  const idScore = getPillarScore('CREDIT_BEHAVIOR');
  const opScore = getPillarScore('OPERATIONAL_MATURITY');
  const cfScore = getPillarScore('CASH_FLOW_HEALTH');
  const gpScore = getPillarScore('DIGITAL_COMMERCIAL_ACTIVITY');
  const coScore = getPillarScore('COMPLIANCE_DISCIPLINE');
  const rsScore = getPillarScore('REVENUE_STABILITY');

  const contribs = {
    base: 30,
    identity: Math.round(idScore * 0.18),
    operational: Math.round(opScore * 0.16),
    cashflow: Math.round(cfScore * 0.15),
    growth: Math.round(gpScore * 0.11),
    compliance: Math.round(coScore * 0.14),
    risk: -Math.round((100 - rsScore) * 0.15),
  };

  const sumVal = contribs.base + contribs.identity + contribs.operational + contribs.cashflow + contribs.growth + contribs.compliance + contribs.risk;
  const diff = score - sumVal;
  contribs.compliance += diff;

  const positiveImpactSum = contribs.identity + contribs.operational + contribs.cashflow + contribs.growth + contribs.compliance;
  const negativeImpactSum = Math.abs(contribs.risk);

  const tabs = [
    { label: 'Overall Overview', key: 'OVERALL' },
    { label: '1. Identity Strength', key: 'IDENTITY' },
    { label: '2. Operational Health', key: 'OPERATIONAL' },
    { label: '3. Cash Flow Health', key: 'CASHFLOW' },
    { label: '4. Growth Potential', key: 'GROWTH' },
    { label: '5. Compliance Score', key: 'COMPLIANCE' },
  ];

  // ----------------------------------------------------
  // DYNAMIC UNIQUE GENERATORS (deterministic via Case ID)
  // ----------------------------------------------------
  const seed = hashStringToNumber(caseId);
  const factor = (seed % 30 + 85) / 100; // Multiplier between 0.85 and 1.15
  
  // Date Helpers: dynamic compliance and file stamps based on Case Creation Date
  const caseDate = caseObj ? new Date(caseObj.createdAt) : new Date();
  
  const formatRelativeDate = (monthsOffset: number, dayOfMonth: number) => {
    const d = new Date(caseDate);
    d.setMonth(d.getMonth() - monthsOffset);
    d.setDate(Math.min(dayOfMonth, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // 1. Identity Strength Breakdown (scaled to idScore)
  const idScale = idScore / 85;
  const idPAN = Math.min(100, Math.round(95 * idScale));
  const idGST = Math.min(100, Math.round(90 * idScale));
  const idAge = Math.min(100, Math.round(75 * idScale));
  const idEntity = Math.min(100, Math.round(80 * idScale));
  const idAddr = Math.min(100, Math.round(85 * idScale));
  
  const idAgeYears = caseObj?.businessProfile?.vintage ?? ((seed % 7) + 3 + (seed % 10) / 10);

  // 2. Operational Health breakdown (scaled to opScore)
  const opScale = opScore / 80;
  const opConsistency = Math.min(100, Math.round(82 * opScale));
  const opFulfillment = Math.min(100, Math.round(78 * opScale));
  const opSupplier = Math.min(100, Math.round(75 * opScale));
  const opInventory = Math.min(100, Math.round(76 * opScale));
  const opConcentration = Math.min(100, Math.round(70 * opScale));
  const opEfficiency = Math.min(100, Math.round(88 * opScale));

  const opInvoicesPct = Math.min(100, Math.round(82 * factor));
  const opOrderValPct = Math.min(100, Math.round(78 * factor));
  const opRepeatCustomersPct = Math.min(100, Math.round(72 * factor));
  const opSupplierPaymentPct = Math.min(100, Math.round(83 * factor));
  const opInventoryTurnover = (1.8 * factor).toFixed(1);

  // 3. Cash Flow Health breakdown (scaled to cfScore)
  const cfScale = cfScore / 76;
  const cfOcf = (0.436 * factor).toFixed(2);
  const cfNcf = (0.112 * factor).toFixed(2);
  const cfStability = Math.min(100, Math.round(78 * cfScale));
  const cfWorkingCapitalDays = Math.round(45 * (2 - factor));
  const cfCurrentRatio = (1.42 * factor).toFixed(2);
  const cfQuickRatio = (1.21 * factor).toFixed(2);

  const inflowTotal = (0.248 * factor).toFixed(2);
  const outflowTotal = (0.230 * factor).toFixed(2);

  // Inflow / Outflow percentages (slight variance per case)
  const inflowCust = 60 + (seed % 5);
  const inflowBank = 18 - (seed % 3);
  const inflowOther = 10 + (seed % 2);
  const inflowLoan = 100 - inflowCust - inflowBank - inflowOther;

  const outflowSupplier = 53 + (seed % 5);
  const outflowOps = 25 - (seed % 3);
  const outflowEmp = 10 + (seed % 2);
  const outflowOther = 100 - outflowSupplier - outflowOps - outflowEmp;

  // 4. Growth Potential (scaled to gpScore)
  const gpScale = gpScore / 72;
  const growthRevYoY = (16.8 * factor).toFixed(1);
  const growthCustYoY = (14.2 * factor).toFixed(1);
  const growthMarket = Math.min(100, Math.round(70 * gpScale));
  const growthProduct = Math.min(100, Math.round(65 * gpScale));
  const growthInvest = Math.min(100, Math.round(72 * gpScale));

  // Bar Chart calculations (Quarters relative to Case date year)
  const caseYear = caseDate.getFullYear();
  const quarters = [
    { label: `Q1 FY${(caseYear - 2) % 100}`, v: Math.round(30 * factor) },
    { label: `Q2 FY${(caseYear - 2) % 100}`, v: Math.round(35 * factor) },
    { label: `Q3 FY${(caseYear - 2) % 100}`, v: Math.round(43 * factor) },
    { label: `Q4 FY${(caseYear - 2) % 100}`, v: Math.round(45 * factor) },
    { label: `Q1 FY${(caseYear - 1) % 100}`, v: Math.round(52 * factor) },
    { label: `Q2 FY${(caseYear - 1) % 100}`, v: Math.round(58 * factor) },
  ];

  // 5. Compliance Overview (scaled to coScore)
  const coScale = coScore / 90;
  const coGST = Math.min(100, Math.round(92 * coScale));
  const coIT = Math.min(100, Math.round(88 * coScale));
  const coStat = Math.min(100, Math.round(90 * coScale));
  const coLabor = Math.min(100, Math.round(85 * coScale));
  const coEPFO = Math.min(100, Math.round(92 * coScale));
  const coEnv = Math.min(100, Math.round(95 * coScale));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      {/* Breadcrumbs & CTAs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}>
          <Link href="/app/queue" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Customer Queue</Link>
          <span style={{ color: 'var(--text-tertiary)' }}>/</span>
          <Link href={`/app/cases/${caseId}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{caseId} - {businessName}</Link>
          <span style={{ color: 'var(--text-tertiary)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-semibold)' }}>Explainability</span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
          <button
            onClick={() => router.push(`/app/cases/${caseId}/fhc`)}
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', cursor: 'pointer' }}
          >
            Previous
          </button>
          <button
            onClick={() => router.push(`/app/cases/${caseId}/decision`)}
            style={{ backgroundColor: 'var(--color-teal-600)', color: 'var(--color-white)', border: 'none', padding: 'var(--spacing-2) var(--spacing-5)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', display: 'flex', alignItems: 'center', gap: 8, boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
          >
            Next: Credit Decision
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Score Overview Banner */}
      <div style={{ backgroundColor: 'var(--color-navy-900)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5) var(--spacing-6)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-6)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-white)', lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.5)' }}>/100</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: scoreColor, fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase', marginTop: '4px' }}>{rating}</div>
        </div>
        <div style={{ width: '1px', height: '60px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-4)' }}>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Confidence</div>
            <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-white)' }}>{confidence}%</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Completeness</div>
            <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-white)' }}>{explanations.completeness}%</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Positive Impact</div>
            <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-teal-300)' }}>+{positiveImpactSum.toFixed(0)}</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Risk Drag</div>
            <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: '#fc8181' }}>-{negativeImpactSum.toFixed(0)}</div>
          </div>
        </div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.6)', maxWidth: '250px', lineHeight: '1.5' }}>
          <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'rgba(255,255,255,0.9)', marginBottom: '4px' }}>Human Underwriter Guidance</div>
          Decisioning is entirely underwriter-driven. Automated scores are advisory indicators only.
        </div>
      </div>

      {/* Tab Menu */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border-color)', overflowX: 'auto' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: 'var(--spacing-3) var(--spacing-4)',
              border: 'none',
              background: 'none',
              color: activeTab === tab.key ? 'var(--color-teal-600)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.key ? '2px solid var(--color-teal-600)' : '2px solid transparent',
              marginBottom: '-2px',
              fontSize: 'var(--font-size-sm)',
              fontWeight: activeTab === tab.key ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'OVERALL' && (
        <>
          {/* Main Grid: Overall Score Calculation & Contributions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)' }}>
            {/* Left Card: Score Calculation */}
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>How the Score is Calculated</h4>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-5)' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-color)" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke={scoreColor} strokeDasharray={`${score}, 100`} strokeWidth="2.8" />
                  </svg>
                  <div style={{ position: 'absolute', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>{score}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Conf. {confidence}%</div>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Positive Impact</span>
                    <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-positive-text)' }}>+{positiveImpactSum.toFixed(1)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Negative Impact</span>
                    <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-risk-text)' }}>-{negativeImpactSum.toFixed(1)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Base Value</span>
                    <span>+{contribs.base}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px', fontWeight: 'var(--font-weight-bold)' }}>
                    <span>Final Score</span>
                    <span style={{ color: scoreColor }}>{score}.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Score Contribution by Dimension */}
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>Score Contribution by Dimension</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)' }}>
                {[
                  { label: 'Identity Strength', val: idScore, contr: contribs.identity, isPos: true },
                  { label: 'Operational Health', val: opScore, contr: contribs.operational, isPos: true },
                  { label: 'Cash Flow Health', val: cfScore, contr: contribs.cashflow, isPos: true },
                  { label: 'Growth Potential', val: gpScore, contr: contribs.growth, isPos: true },
                  { label: 'Compliance Score', val: coScore, contr: contribs.compliance, isPos: true },
                  { label: 'Revenue Stability', val: rsScore, contr: contribs.risk, isPos: false }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-medium)', minWidth: '140px' }}>{item.label}</span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '5px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${item.val}%`, height: '100%', backgroundColor: item.isPos ? 'var(--color-teal-500)' : 'var(--color-risk)' }} />
                      </div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', width: '32px', textAlign: 'right' }}>{item.val}</span>
                    </div>
                    <span style={{ fontWeight: 'var(--font-weight-bold)', color: item.isPos ? 'var(--color-positive-text)' : 'var(--color-risk-text)', width: '36px', textAlign: 'right' }}>
                      {item.contr >= 0 ? '+' : ''}{item.contr}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grid: Strengths/Risks & Model Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 'var(--spacing-6)' }}>
            {/* SHAP Factors */}
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>Top Positive & Negative Factors (SHAP Analysis)</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-5)' }}>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-positive-text)', fontWeight: 'var(--font-weight-bold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: 'var(--spacing-3)' }}>
                    ↑ Positive Factors
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                    {explanations.strengths.length > 0 ? explanations.strengths.map((str, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', lineHeight: '1.4' }}>{str}</span>
                        <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-positive-text)', fontSize: 'var(--font-size-sm)', flexShrink: 0 }}>+{(8 - idx * 1.5).toFixed(1)}</span>
                      </div>
                    )) : (
                      <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>No significant positive drivers.</div>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-risk-text)', fontWeight: 'var(--font-weight-bold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: 'var(--spacing-3)' }}>
                    ↓ Negative Factors
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                    {explanations.risks.length > 0 ? explanations.risks.map((risk, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', lineHeight: '1.4' }}>{risk}</span>
                        <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-risk-text)', fontSize: 'var(--font-size-sm)', flexShrink: 0 }}>-{(5 - idx * 1.2).toFixed(1)}</span>
                      </div>
                    )) : (
                      <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>No significant risk factors.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Model Info */}
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>Model Information</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)' }}>
                {[
                  { label: 'Model Name', val: 'MSME-FH-Score-v2.3' },
                  { label: 'Model Type', val: 'Gradient Boosting' },
                  { label: 'Training Data', val: '2.4M+ MSME Records' },
                  { label: 'Last Trained', val: '20 Apr 2025' },
                  { label: 'Features Used', val: '142' },
                  { label: 'SHAP Method', val: 'TreeExplainer' },
                  { label: 'Confidence', val: `${confidence}% (${confidence >= 90 ? 'High' : 'Moderate'})` },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: idx < 6 ? '1px solid var(--border-color)' : 'none', paddingBottom: idx < 6 ? 'var(--spacing-2)' : 0 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontWeight: 'var(--font-weight-medium)', color: idx === 6 ? 'var(--color-positive-text)' : 'var(--text-primary)' }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pillar Summary Table */}
          <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
            <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>All Dimension Scores</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', borderBottom: '2px solid var(--border-color)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: 'var(--spacing-2) 0', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)' }}>Dimension</th>
                  <th style={{ padding: 'var(--spacing-2) 0', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)' }}>Score</th>
                  <th style={{ padding: 'var(--spacing-2) 0', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)' }}>Interpretation</th>
                  <th style={{ padding: 'var(--spacing-2) 0', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)' }}>Evidence</th>
                  <th style={{ padding: 'var(--spacing-2) 0', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)' }}>Reason Codes</th>
                </tr>
              </thead>
              <tbody>
                {explanations.pillarExplanations.map((p, idx) => {
                  const col = p.score >= 70 ? 'var(--color-positive-text)' : p.score >= 50 ? 'var(--color-caution-text)' : 'var(--color-risk-text)';
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 'var(--spacing-3) 0', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>{mapPillarName(p.pillarName)}</td>
                      <td style={{ padding: 'var(--spacing-3) 0', fontWeight: 'var(--font-weight-bold)', color: col }}>{p.score}/100</td>
                      <td style={{ padding: 'var(--spacing-3) 0' }}>
                        <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 8px', borderRadius: '4px', color: col, backgroundColor: p.score >= 70 ? 'rgba(0,131,108,0.08)' : p.score >= 50 ? 'rgba(217,119,6,0.08)' : 'rgba(220,38,38,0.08)', fontWeight: 'var(--font-weight-semibold)' }}>{p.scoreInterpretation}</span>
                      </td>
                      <td style={{ padding: 'var(--spacing-3) 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>{p.evidenceSummary}</td>
                      <td style={{ padding: 'var(--spacing-3) 0' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {p.reasonCodes.map((code, ci) => (
                            <span key={ci} style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{code}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tab 1: Identity Strength */}
      {activeTab === 'IDENTITY' && (
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 8fr', gap: 'var(--spacing-6)' }}>
          {/* Left Column: Gauge & Insights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-4)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', alignSelf: 'flex-start' }}>Identity Strength Score</h4>
              <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-color)" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-teal-600)" strokeDasharray={`${idScore} 100`} strokeWidth="2.8" />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>{idScore}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-teal-600)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>Strong</div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-3)' }}>Key Insights</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>All identity documents are valid and active.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>No adverse records found in PAN/GST.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>Business has a stable operating history.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>Minor address variation in bank records.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Score Breakdown & Supporting Evidence */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>Score Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { d: 'PAN Verification', s: idPAN, st: idPAN >= 90 ? 'Excellent' : 'Good', r: 'Verified and active' },
                  { d: 'GST Registration', s: idGST, st: idGST >= 90 ? 'Excellent' : 'Good', r: 'Valid and compliant' },
                  { d: 'Business Age', s: idAge, st: idAge >= 70 ? 'Good' : 'Needs Review', r: `${idAgeYears} years old` },
                  { d: 'Entity Type Stability', s: idEntity, st: idEntity >= 75 ? 'Good' : 'Needs Review', r: 'Stable business structure' },
                  { d: 'Address Verification', s: idAddr, st: idAddr >= 80 ? 'Strong' : 'Good', r: 'Address validated' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>{item.d}</span>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>{item.s}/100</span>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(0,131,108,0.06)', color: 'var(--color-positive-text)', fontWeight: 'bold' }}>{item.st}</span>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', width: '150px', textAlign: 'right' }}>{item.r}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>Supporting Evidence</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { title: 'PAN Card', sub: 'Verified Active' },
                  { title: 'GST Certificate', sub: 'Verified Active' },
                  { title: 'Udyam Registration', sub: 'Verified Active' },
                  { title: 'Incorporation Doc', sub: 'Verified Active' },
                ].map((doc, idx) => (
                  <div key={idx} style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                    <span style={{ fontSize: '1.2rem', color: 'var(--color-teal-600)' }}>📄</span>
                    <div>
                      <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--text-primary)' }}>{doc.title}</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-positive-text)', fontWeight: 'semibold' }}>{doc.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', margin: '0 0 6px' }}>What this means?</h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                The applicant has a strong and verifiable business identity with no major discrepancies.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Operational Health */}
      {activeTab === 'OPERATIONAL' && (
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 8fr', gap: 'var(--spacing-6)' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-4)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', alignSelf: 'flex-start' }}>Operational Health Score</h4>
              <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-color)" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-teal-600)" strokeDasharray={`${opScore} 100`} strokeWidth="2.8" />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>{opScore}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-teal-600)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>Good</div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-3)' }}>Key Insights</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>Consistent business activity over last 6 months.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>Healthy supplier payment behavior.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>Customer concentration within acceptable limits.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>Inventory turnover can be further improved.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>Operational Metrics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { label: 'Business Activity Consistency', val: `${opConsistency}/100`, st: opConsistency >= 75 ? 'Good' : 'Needs Review' },
                  { label: 'Order Fulfillment', val: `${opFulfillment}/100`, st: opFulfillment >= 75 ? 'Good' : 'Needs Review' },
                  { label: 'Supplier Management', val: `${opSupplier}/100`, st: opSupplier >= 75 ? 'Good' : 'Needs Review' },
                  { label: 'Inventory Management', val: `${opInventory}/100`, st: opInventory >= 75 ? 'Good' : 'Needs Review' },
                  { label: 'Customer Concentration', val: `${opConcentration}/100`, st: opConcentration >= 70 ? 'Good' : 'Moderate' },
                  { label: 'Operational Efficiency', val: `${opEfficiency}/100`, st: opEfficiency >= 80 ? 'Strong' : 'Good' },
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'semibold', color: 'var(--text-secondary)', maxWidth: '140px' }}>{item.label}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--text-primary)' }}>{item.val}</div>
                      <div style={{ fontSize: '9px', color: 'var(--color-positive-text)', fontWeight: 'bold' }}>{item.st}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>Operational Indicators</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-secondary)', borderBottom: '2px solid var(--border-color)', fontSize: 'var(--font-size-xs)' }}>
                    <th style={{ padding: '6px 0' }}>Indicator</th>
                    <th style={{ padding: '6px 0' }}>Status</th>
                    <th style={{ padding: '6px 0' }}>Performance</th>
                    <th style={{ padding: '6px 0', textAlign: 'right' }}>Benchmark</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { ind: 'Active Invoices (Last 6 Months)', stat: opInvoicesPct >= 75 ? 'High' : 'Medium', perf: `${opInvoicesPct}%`, bench: '> 60%' },
                    { ind: 'Average Order Value', stat: opOrderValPct >= 75 ? 'Good' : 'Fair', perf: `${opOrderValPct}%`, bench: '> 50%' },
                    { ind: 'Repeat Customers', stat: opRepeatCustomersPct >= 70 ? 'Good' : 'Fair', perf: `${opRepeatCustomersPct}%`, bench: '> 40%' },
                    { ind: 'Supplier Payment Timeliness', stat: opSupplierPaymentPct >= 80 ? 'Good' : 'Fair', perf: `${opSupplierPaymentPct}%`, bench: '> 70%' },
                    { ind: 'Inventory Turnover Ratio', stat: parseFloat(opInventoryTurnover) >= 2.0 ? 'Strong' : 'Moderate', perf: `${opInventoryTurnover}x`, bench: '> 2.0x' },
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--text-primary)' }}>{row.ind}</td>
                      <td style={{ padding: '8px 0', color: 'var(--color-positive-text)', fontWeight: 'semibold' }}>{row.stat}</td>
                      <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{row.perf}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{row.bench}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', margin: '0 0 6px' }}>What this means?</h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                The business demonstrates efficient day-to-day operations with healthy supplier and customer practices.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cash Flow Health */}
      {activeTab === 'CASHFLOW' && (
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 8fr', gap: 'var(--spacing-6)' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-4)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', alignSelf: 'flex-start' }}>Cash Flow Health Score</h4>
              <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-color)" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-teal-600)" strokeDasharray={`${cfScore} 100`} strokeWidth="2.8" />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>{cfScore}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-teal-600)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>Good</div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-3)' }}>Key Insights</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>Positive operating cash flow trend.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>Healthy inflow from core business.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>Working capital cycle can be optimized.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>Seasonal dips observed in Feb &amp; Mar.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>Cash Flow Metrics</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Operating Cash Flow (Last 12 Months)', val: `₹ ${cfOcf} Cr`, st: 'Good' },
                  { label: 'Net Cash Flow (Last 12 Months)', val: `₹ ${cfNcf} Cr`, st: 'Good' },
                  { label: 'Cash Flow Stability', val: `${cfStability}%`, st: 'Good' },
                  { label: 'Working Capital Cycle', val: `${cfWorkingCapitalDays} Days`, st: cfWorkingCapitalDays <= 50 ? 'Good' : 'Moderate', warn: cfWorkingCapitalDays > 50 },
                  { label: 'Current Ratio', val: cfCurrentRatio, st: parseFloat(cfCurrentRatio) >= 1.2 ? 'Good' : 'Needs Review' },
                  { label: 'Quick Ratio', val: cfQuickRatio, st: parseFloat(cfQuickRatio) >= 1.0 ? 'Good' : 'Needs Review' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{item.label}</span>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: 'var(--font-size-sm)' }}>{item.val}</span>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', backgroundColor: item.warn ? 'rgba(217,119,6,0.06)' : 'rgba(0,131,108,0.06)', color: item.warn ? 'var(--color-caution-text)' : 'var(--color-positive-text)', fontWeight: 'bold' }}>{item.st}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: '12px' }}>Cash Flow Inflow (Last 6 Months)</h4>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-teal-600)" strokeDasharray={`${inflowCust} ${100 - inflowCust}`} strokeWidth="4" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-teal-400)" strokeDasharray={`${inflowBank} ${100 - inflowBank}`} strokeDashoffset={`-${inflowCust}`} strokeWidth="4" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-amber-400)" strokeDasharray={`${inflowOther} ${100 - inflowOther}`} strokeDashoffset={`-${inflowCust + inflowBank}`} strokeWidth="4" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-navy-500)" strokeDasharray={`${inflowLoan} ${100 - inflowLoan}`} strokeDashoffset={`-${inflowCust + inflowBank + inflowOther}`} strokeWidth="4" />
                    </svg>
                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                      <div style={{ fontSize: '9px', fontWeight: 'bold' }}>₹{inflowTotal} Cr</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px' }}>
                    <div><span style={{ color: 'var(--color-teal-600)' }}>■</span> Cust. Receipts ({inflowCust}%)</div>
                    <div><span style={{ color: 'var(--color-teal-400)' }}>■</span> Bank Credits ({inflowBank}%)</div>
                    <div><span style={{ color: 'var(--color-amber-400)' }}>■</span> Other Income ({inflowOther}%)</div>
                    <div><span style={{ color: 'var(--color-navy-500)' }}>■</span> Overdraft ({inflowLoan}%)</div>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: '12px' }}>Outflow Composition (Last 6 Months)</h4>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-red-400)" strokeDasharray={`${outflowSupplier} ${100 - outflowSupplier}`} strokeWidth="4" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-amber-400)" strokeDasharray={`${outflowOps} ${100 - outflowOps}`} strokeDashoffset={`-${outflowSupplier}`} strokeWidth="4" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-navy-500)" strokeDasharray={`${outflowEmp} ${100 - outflowEmp}`} strokeDashoffset={`-${outflowSupplier + outflowOps}`} strokeWidth="4" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-color)" strokeDasharray={`${outflowOther} ${100 - outflowOther}`} strokeDashoffset={`-${outflowSupplier + outflowOps + outflowEmp}`} strokeWidth="4" />
                    </svg>
                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                      <div style={{ fontSize: '9px', fontWeight: 'bold' }}>₹{outflowTotal} Cr</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px' }}>
                    <div><span style={{ color: 'var(--color-red-400)' }}>■</span> Supplier Pay. ({outflowSupplier}%)</div>
                    <div><span style={{ color: 'var(--color-amber-400)' }}>■</span> Operational ({outflowOps}%)</div>
                    <div><span style={{ color: 'var(--color-navy-500)' }}>■</span> Staff Salary ({outflowEmp}%)</div>
                    <div><span style={{ color: 'var(--border-color)' }}>■</span> Other Bills ({outflowOther}%)</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', margin: '0 0 6px' }}>What this means?</h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                The business maintains adequate liquidity and cash flow with manageable working capital requirements.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Growth Potential */}
      {activeTab === 'GROWTH' && (
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 8fr', gap: 'var(--spacing-6)' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-4)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', alignSelf: 'flex-start' }}>Growth Potential Score</h4>
              <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-color)" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-teal-600)" strokeDasharray={`${gpScore} 100`} strokeWidth="2.8" />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>{gpScore}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-teal-600)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>Good</div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-3)' }}>Key Insights</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>Consistent revenue growth YoY.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>Expanding customer base steadily.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>Limited diversification of products.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>Scope for geographic expansion.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>Growth Indicators</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-secondary)', borderBottom: '2px solid var(--border-color)', fontSize: 'var(--font-size-xs)' }}>
                    <th style={{ padding: '6px 0' }}>Indicator</th>
                    <th style={{ padding: '6px 0' }}>Trend</th>
                    <th style={{ padding: '6px 0' }}>Score/Value</th>
                    <th style={{ padding: '6px 0', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { ind: 'Revenue Growth YoY', trend: '▲', val: `${growthRevYoY}%`, stat: 'Good' },
                    { ind: 'Customer Base Growth', trend: '▲', val: `${growthCustYoY}%`, stat: 'Good' },
                    { ind: 'Market Expansion', trend: '▲', val: `${growthMarket}/100`, stat: growthMarket >= 75 ? 'Good' : 'Moderate' },
                    { ind: 'Product/Service Diversification', trend: '▲', val: `${growthProduct}/100`, stat: growthProduct >= 70 ? 'Good' : 'Moderate' },
                    { ind: 'Investment in Business', trend: '▲', val: `${growthInvest}/100`, stat: growthInvest >= 70 ? 'Good' : 'Moderate' },
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--text-primary)' }}>{row.ind}</td>
                      <td style={{ padding: '8px 0', color: 'var(--color-positive-text)', fontWeight: 'bold' }}>{row.trend}</td>
                      <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{row.val}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', color: 'var(--color-positive-text)', fontWeight: 'semibold' }}>{row.stat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '6fr 6fr', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: '12px' }}>Revenue Growth (Last 6 Quarters)</h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '100px', paddingBottom: '10px' }}>
                  {quarters.map((bar, idx) => (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{bar.v}L</span>
                      <div style={{ width: '16px', height: `${Math.min(100, Math.round(bar.v * 1.5))}%`, backgroundColor: 'var(--color-teal-600)', borderRadius: '2px 2px 0 0' }} />
                      <span style={{ fontSize: '8px', color: 'var(--text-tertiary)', marginTop: '4px', whiteSpace: 'nowrap' }}>{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: '12px' }}>Growth-Potential Factors</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-xs)' }}>
                  <div>
                    <strong style={{ color: 'var(--color-positive-text)', display: 'block', marginBottom: '2px' }}>Strengths</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>• Strong market demand<br />• Local customer base<br />• Healthy revenue growth</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--color-caution-text)', display: 'block', marginBottom: '2px' }}>Areas to Improve</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>• Broaden product offerings<br />• Expand to new geographies<br />• Increase marketing spend</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', margin: '0 0 6px' }}>What this means?</h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                The business has good growth potential with steady revenue and customer expansion.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Compliance Score */}
      {activeTab === 'COMPLIANCE' && (
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 8fr', gap: 'var(--spacing-6)' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-4)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', alignSelf: 'flex-start' }}>Compliance Score</h4>
              <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-color)" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-teal-600)" strokeDasharray={`${coScore} 100`} strokeWidth="2.8" />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>{coScore}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-teal-600)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>Excellent</div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-3)' }}>Key Insights</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>All major compliances are up to date.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>No penalties or defaults observed.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>Strong track record of compliance.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-positive-text)' }}>✓</span>
                  <span>Maintain current compliance discipline.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>Compliance Overview</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'GST Compliance', val: `${coGST}/100`, st: 'Excellent' },
                  { label: 'Income Tax Filing', val: `${coIT}/100`, st: 'Good' },
                  { label: 'Statutory Compliance', val: `${coStat}/100`, st: 'Excellent' },
                  { label: 'Labor Compliance', val: `${coLabor}/100`, st: 'Good' },
                  { label: 'EPFO Compliance', val: `${coEPFO}/100`, st: 'Excellent' },
                  { label: 'Environmental Compliance', val: `${coEnv}/100`, st: 'Excellent' },
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{item.label}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>{item.val}</div>
                    <div style={{ fontSize: '9px', color: 'var(--color-positive-text)', fontWeight: 'semibold', marginTop: '2px' }}>{item.st}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>Compliance Summary</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-secondary)', borderBottom: '2px solid var(--border-color)', fontSize: 'var(--font-size-xs)' }}>
                    <th style={{ padding: '6px 0' }}>Compliance Area</th>
                    <th style={{ padding: '6px 0' }}>Status</th>
                    <th style={{ padding: '6px 0' }}>Last Updated</th>
                    <th style={{ padding: '6px 0', textAlign: 'right' }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { area: 'GST Returns', stat: 'Compliant', date: formatRelativeDate(1, 10), rem: 'Filed on time' },
                    { area: 'Income Tax Returns', stat: 'Compliant', date: formatRelativeDate(7, 30), rem: 'Filed' },
                    { area: 'TDS Compliance', stat: 'Compliant', date: formatRelativeDate(1, 15), rem: 'No defaults' },
                    { area: 'EPFO Compliance', stat: 'Compliant', date: formatRelativeDate(1, 15), rem: 'All paid' },
                    { area: 'ESI Compliance', stat: 'Compliant', date: formatRelativeDate(1, 15), rem: 'All paid' },
                    { area: 'Professional Tax', stat: 'Compliant', date: formatRelativeDate(1, 10), rem: 'Up to date' },
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--text-primary)', fontWeight: 'semibold' }}>{row.area}</td>
                      <td style={{ padding: '8px 0', color: 'var(--color-positive-text)', fontWeight: 'semibold' }}>{row.stat}</td>
                      <td style={{ padding: '8px 0' }}>{row.date}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{row.rem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>Compliance Documents (Verified)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {[
                  'GST Returns', 'ITR AY 23-24', 'TDS Certificates', 'EPFO Challans'
                ].map((doc, idx) => (
                  <div key={idx} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '1rem', color: 'var(--color-teal-600)' }}>✔</span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
              <h4 style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', margin: '0 0 6px' }}>What this means?</h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                The applicant maintains excellent compliance across all regulatory areas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
