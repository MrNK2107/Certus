'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CaseDetail {
  caseId: string;
  businessName: string;
}

export default function EvidencePage({ params }: { params: Promise<{ caseId: string }> }) {
  const router = useRouter();
  const [caseId, setCaseId] = useState<string>('');
  const [caseObj, setCaseObj] = useState<CaseDetail | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState('GST');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setCaseId(p.caseId));
  }, [params]);

  useEffect(() => {
    if (!caseId) return;

    async function fetchCaseData() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${baseUrl}/api/v1/cases/${caseId}`);
        if (res.ok) {
          const json = await res.json();
          setCaseObj(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCaseData();
  }, [caseId]);

  if (loading || !caseId) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-secondary)' }}>Loading evidence repository...</div>;
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
          <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-semibold)' }}>Evidence Repository</span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
          <button 
            onClick={() => router.push(`/app/cases/${caseId}`)}
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}
          >
            Previous
          </button>
          
          <button 
            onClick={() => router.push(`/app/cases/${caseId}/fhc`)}
            style={{ backgroundColor: 'var(--color-teal-600)', color: 'var(--color-white)', border: 'none', padding: 'var(--spacing-2) var(--spacing-5)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)' }}
          >
            Next: Health Card
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--spacing-3)' }}>
        {[
          { label: 'Total Data Sources', val: '11', col: 'var(--text-primary)' },
          { label: 'Sources Available', val: '9 / 81.8%', col: 'var(--color-positive-text)' },
          { label: 'Evidence Items Extracted', val: '1,245', col: 'var(--color-navy-700)' },
          { label: 'High Quality Data', val: '892 / 71.7%', col: 'var(--color-positive-text)' },
          { label: 'Conflicts Detected', val: '23', col: 'var(--color-risk-text)' },
          { label: 'Last Updated', val: '01 May 2025', col: 'var(--text-secondary)' }
        ].map((m, idx) => (
          <div key={idx} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-4)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{m.label}</div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: m.col || 'var(--text-primary)' }}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Main Grid: Data Sources table & Key Insights + Quality Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 'var(--spacing-6)' }}>
        
        {/* Left Column: Data Sources & Extraction Status */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>
            Data Sources &amp; Extraction Status
          </h4>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', borderBottom: '2px solid var(--border-color)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: 'var(--spacing-2) 0', fontWeight: 'var(--font-weight-semibold)' }}>Source</th>
                <th style={{ padding: 'var(--spacing-2) 0', fontWeight: 'var(--font-weight-semibold)' }}>Status</th>
                <th style={{ padding: 'var(--spacing-2) 0', fontWeight: 'var(--font-weight-semibold)' }}>Records Extracted</th>
                <th style={{ padding: 'var(--spacing-2) 0', fontWeight: 'var(--font-weight-semibold)' }}>Data Quality</th>
                <th style={{ padding: 'var(--spacing-2) 0', fontWeight: 'var(--font-weight-semibold)' }}>Last Extracted</th>
                <th style={{ padding: 'var(--spacing-2) 0', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { s: 'GST Returns', status: 'Processed', rec: '48', qual: '92%', col: 'var(--color-positive-text)' },
                { s: 'Bank Statements', status: 'Processed', rec: '1,876', qual: '88%', col: 'var(--color-positive-text)' },
                { s: 'ITR / Financials', status: 'Processed', rec: '3', qual: '90%', col: 'var(--color-positive-text)' },
                { s: 'Invoices', status: 'Processed', rec: '215', qual: '76%', col: 'var(--color-positive-text)' },
                { s: 'UPI Transactions', status: 'Processed', rec: '2,430', qual: '81%', col: 'var(--color-positive-text)' },
                { s: 'E-Way Bills', status: 'Processed', rec: '186', qual: '74%', col: 'var(--color-positive-text)' },
                { s: 'EPFO / Payroll', status: 'Partial', rec: '120', qual: '56%', col: 'var(--color-caution-text)' },
                { s: 'Credit Bureau', status: 'Processed', rec: '1', qual: '98%', col: 'var(--color-positive-text)' },
                { s: 'Utility Bills', status: 'Partial', rec: '8', qual: '44%', col: 'var(--color-caution-text)' },
                { s: 'Other Documents', status: 'Processed', rec: '24', qual: '85%', col: 'var(--color-positive-text)' },
                { s: 'Web Presence', status: 'Processed', rec: '17', qual: '70%', col: 'var(--color-positive-text)' }
              ].map((d, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: 'var(--spacing-3) 0', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{d.s}</td>
                  <td style={{ padding: 'var(--spacing-3) 0' }}>
                    <span style={{ color: d.status === 'Processed' ? 'var(--color-positive-text)' : 'var(--color-caution-text)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {d.status}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--spacing-3) 0', color: 'var(--text-secondary)' }}>{d.rec}</td>
                  <td style={{ padding: 'var(--spacing-3) 0', color: d.col, fontWeight: 'var(--font-weight-bold)' }}>{d.qual}</td>
                  <td style={{ padding: 'var(--spacing-3) 0', color: 'var(--text-secondary)' }}>01 May 2025, 10:38 AM</td>
                  <td style={{ padding: 'var(--spacing-3) 0', textAlign: 'right' }}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="14" height="14" style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column: Key Insights & Data Quality Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          {/* Key Insights */}
          <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
            <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>Key Insights from Evidence</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)' }}>
              {[
                { text: 'Consistent GST filing for last 12 months', type: 'pos' },
                { text: 'Healthy bank balance trend with low bounce rate', type: 'pos' },
                { text: 'Top customer concentration: 32%', type: 'pos' },
                { text: 'Regular UPI inflows from 64 unique customers', type: 'pos' },
                { text: 'Seasonal business with peak revenues in Q4 & Q1', type: 'pos' },
                { text: 'EPFO data incomplete for last 3 months', type: 'warn' }
              ].map((ins, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: ins.type === 'warn' ? 'var(--color-risk-text)' : 'var(--text-primary)' }}>
                  <span style={{ color: ins.type === 'warn' ? 'var(--color-risk)' : 'var(--color-positive)', flexShrink: 0, marginTop: '1px' }}>
                    {ins.type === 'warn' ? (
                      <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                  <span>{ins.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quality Distribution */}
          <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)', flex: 1 }}>
            <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>Data Quality Distribution</h4>
            <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
              {/* Donut */}
              <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-teal-600)" strokeDasharray="35 65" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-teal-400)" strokeDasharray="36 64" strokeDashoffset="-35" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-amber-400)" strokeDasharray="20 80" strokeDashoffset="-71" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-red-400)" strokeDasharray="9 91" strokeDashoffset="-91" strokeWidth="4" />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)' }}>1,111</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Total</div>
                </div>
              </div>
              {/* Legend */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                {[
                  { label: 'Excellent (≥90%)', pct: '35%', count: 388, col: 'var(--color-teal-600)' },
                  { label: 'Good (75–90%)', pct: '36%', count: 400, col: 'var(--color-teal-400)' },
                  { label: 'Medium (50–75%)', pct: '20%', count: 223, col: 'var(--color-amber-400)' },
                  { label: 'Low (<50%)', pct: '9%', count: 100, col: 'var(--color-red-400)' },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-medium)' }}>{item.label}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.pct} <span style={{ color: 'var(--text-tertiary)' }}>({item.count})</span></span>
                    </div>
                    <div style={{ height: '5px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: item.pct, height: '100%', backgroundColor: item.col, borderRadius: '2px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Preview panel (GST summary details etc.) */}
      <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
          <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>Evidence Preview</h4>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', borderBottom: '1px solid var(--border-color)' }}>
            {['GST Summary', 'Bank Summary', 'Cash Flow', 'Top Customers', 'Top Suppliers', 'UPI Summary'].map((tab) => {
              const tabKey = tab.split(' ')[0].toUpperCase();
              const isSelected = activePreviewTab === tabKey;
              return (
                <button
                  key={tab}
                  onClick={() => setActivePreviewTab(tabKey)}
                  style={{ padding: 'var(--spacing-1) var(--spacing-3)', border: 'none', background: isSelected ? 'var(--color-navy-50)' : 'none', color: isSelected ? 'var(--color-navy-700)' : 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', cursor: 'pointer' }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* GST Preview Cards */}
        {activePreviewTab === 'GST' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--spacing-4)' }}>
            {[
              { label: 'Annual Turnover (FY24)', val: '₹ 7.86 Cr', change: '▲ 12.4% vs FY23', positive: true },
              { label: 'Total Tax Paid (FY24)', val: '₹ 48.6 L', change: '▲ 8.7% vs FY23', positive: true },
              { label: 'GST Returns Filed', val: '12 / 12', change: '100% Filed', positive: true },
              { label: 'GSTR-3B Avg. Late Days', val: '2', change: 'Good Compliance', positive: true },
              { label: 'ITC Availment (FY24)', val: '₹ 1.24 Cr', change: '71% of Eligible', positive: true }
            ].map((card, idx) => (
              <div key={idx} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{card.label}</div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>{card.val}</div>
                <div style={{ fontSize: '9px', color: 'var(--color-positive)', fontWeight: 'var(--font-weight-semibold)' }}>{card.change}</div>
              </div>
            ))}
          </div>
        )}

        {activePreviewTab !== 'GST' && (
          <div style={{ display: 'flex', height: '80px', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>
            Structured preview data for {activePreviewTab} is processed and ready.
          </div>
        )}
      </div>

      {/* Data Issues / Anomalies & Footer */}
      <div style={{ display: 'grid', gridTemplateColumns: '6fr 6fr', gap: 'var(--spacing-6)' }}>
        
        {/* Data Issues Panel */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-3)' }}>Data Issues / Anomalies</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', fontSize: 'var(--font-size-xs)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--text-primary)' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-risk)', borderRadius: '50%' }} />
                <span>2 invoices with mismatched GSTIN</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--text-primary)' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-risk)', borderRadius: '50%' }} />
                <span>3 transactions flagged as high risk</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--text-primary)' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-caution)', borderRadius: '50%' }} />
                <span>Missing bank statement for Mar 2024</span>
              </li>
            </ul>
          </div>

          <Link href="#" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-info)', fontWeight: 'var(--font-weight-bold)', marginTop: 'var(--spacing-3)', textDecoration: 'none' }}>
            View All Issues (7) →
          </Link>
        </div>

        {/* Process Tracker status */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5) var(--spacing-6)', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-teal-600)', color: 'var(--color-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-xs)' }}>4</div>
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)' }}>Next Step: Financial Health Card</div>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Review AI-generated scores and metrics breakdown.</div>
              </div>
            </div>
            
            <button 
              onClick={() => router.push(`/app/cases/${caseId}/fhc`)}
              style={{ backgroundColor: 'var(--color-teal-600)', color: 'var(--color-white)', border: 'none', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', cursor: 'pointer' }}
            >
              Analyze Scores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
