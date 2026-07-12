'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatusChip } from '@/components/ui';

interface CaseDetail {
  caseId: string;
  businessName: string;
  sector: string;
  status: string;
  createdAt: string;
  businessProfile?: {
    pan?: string;
    gstin?: string;
    udyam?: string;
    entityType?: string;
    vintage?: number;
    turnoverBand?: string;
    location?: string;
    relationshipContext?: string;
  };
}

interface DocumentItem {
  documentId: string;
  fileName: string;
  sourceType: string;
  documentType: string;
  uploadedAt: string;
  size: number;
}

export default function CaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const router = useRouter();
  const [caseId, setCaseId] = useState<string>('');
  const [caseObj, setCaseObj] = useState<CaseDetail | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Unwrap params using React.use() or useEffect
  useEffect(() => {
    params.then((p) => setCaseId(p.caseId));
  }, [params]);

  useEffect(() => {
    if (!caseId) return;

    async function fetchCaseData() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const [cRes, dRes] = await Promise.all([
          fetch(`${baseUrl}/api/v1/cases/${caseId}`, { cache: 'no-store' }),
          fetch(`${baseUrl}/api/v1/sources/${caseId}/documents`, { cache: 'no-store' }),
        ]);

        if (cRes.ok && dRes.ok) {
          const cJson = await cRes.json();
          const dJson = await dRes.json();
          setCaseObj(cJson.data);
          setDocuments(dJson.data || []);
        }
      } catch (err) {
        console.error('Error fetching case detail:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCaseData();
  }, [caseId]);

  if (loading || !caseId) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-secondary)' }}>Loading applicant details...</div>;
  }

  if (!caseObj) {
    return <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>Case not found.</div>;
  }

  const bp = caseObj.businessProfile || {};

  // Filter documents by tab
  const filteredDocs = documents.filter((doc) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'GST') return doc.sourceType === 'GST';
    if (activeTab === 'BANK') return doc.sourceType === 'AA';
    return doc.documentType === activeTab;
  });

  const displayStatus = caseObj.status === 'UNDER_REVIEW' || caseObj.status === 'SCORED' ? 'Pending Review' : caseObj.status === 'DATA_FETCHING' || caseObj.status === 'SCORING' || caseObj.status === 'SOURCE_LINKING' || caseObj.status === 'CONSENT_GRANTED' ? 'In Progress' : caseObj.status === 'DECISIONED' ? 'Completed' : caseObj.status === 'FAILED' ? 'Failed' : 'Requires Action';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      {/* Top Header: Breadcrumbs & CTAs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}>
          <Link href="/app/queue" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Customer Queue</Link>
          <span style={{ color: 'var(--text-tertiary)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-semibold)' }}>{caseObj.caseId} - {caseObj.businessName}</span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
          <button 
            onClick={() => router.push('/app/queue')}
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}
          >
            Back to Queue
          </button>
          
          {(caseObj.status === 'UNDER_REVIEW' || caseObj.status === 'DATA_FETCHING') && (
            <button 
              onClick={() => router.push(`/app/cases/${caseId}/pipeline`)}
              style={{ backgroundColor: 'var(--color-teal-600)', color: 'var(--color-white)', border: 'none', padding: 'var(--spacing-2) var(--spacing-5)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)' }}
            >
              <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Run Pipeline
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 'var(--spacing-6)' }}>
        
        {/* Left: Applicant Summary */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-navy-50)', color: 'var(--color-navy-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--font-weight-bold)' }}>
              {caseObj.businessName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>{caseObj.businessName}</h3>
              <span style={{ fontSize: '11px', color: 'var(--color-teal-600)', backgroundColor: 'var(--color-teal-50)', padding: '1px 6px', borderRadius: '4px', fontWeight: 'var(--font-weight-semibold)' }}>{caseObj.caseId}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginTop: 'var(--spacing-2)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>PAN</div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{bp.pan || 'AABCS1234K'}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>GSTIN</div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{bp.gstin || '27AABCS1234K1ZP'}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Udyam Registration No.</div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{bp.udyam || 'UDYAM-MH-27-0001234'}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Constitution Type</div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{bp.entityType?.replace(/_/g, ' ') || 'Sole Proprietorship'}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Industry / Sector</div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{caseObj.sector}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Business Vintage</div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{bp.vintage ? `${bp.vintage} Years` : '3 Years 8 Months'}</div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Registered Address</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{bp.location || 'Plot 45, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093'}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Contact Number</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>+91 98765 43210</div>
            </div>
          </div>
        </div>

        {/* Right: Submission & Data Availability */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          {/* Submission Details */}
          <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-3)' }}>Submission Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Batch ID</span>
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>BATCH_2025_05_01</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Submitted On</span>
                <span style={{ color: 'var(--text-primary)' }}>{new Date(caseObj.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Data Source</span>
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>File Upload / Connectors</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Files Received</span>
                <span style={{ color: 'var(--text-primary)' }}>{documents.length || 18} files</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Last Updated</span>
                <span style={{ color: 'var(--text-primary)' }}>{new Date(caseObj.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Data Availability Checklist */}
          <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-3)' }}>Data Availability</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-2)' }}>
              {[
                { label: 'GST Data', av: 'Available', col: 'var(--color-positive)' },
                { label: 'Bank Statements', av: 'Available', col: 'var(--color-positive)' },
                { label: 'ITR / Financials', av: 'Available', col: 'var(--color-positive)' },
                { label: 'Invoices', av: 'Available', col: 'var(--color-positive)' },
                { label: 'EPFO / Payroll', av: 'Not Available', col: 'var(--color-risk)' },
                { label: 'Credit Bureau', av: 'Available', col: 'var(--color-positive)' },
                { label: 'Utility Bills', av: 'Partial', col: 'var(--color-caution)' },
                { label: 'Other Documents', av: 'Available', col: 'var(--color-positive)' }
              ].map((d, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-medium)' }}>{d.label}</span>
                  <span style={{ color: d.col, fontWeight: 'var(--font-weight-bold)' }}>{d.av}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Uploaded Documents Table & Missing Info Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 'var(--spacing-6)' }}>
        
        {/* Uploaded Documents List */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', padding: 'var(--spacing-5)' }}>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-3)' }}>Uploaded Documents &amp; Files</h4>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-2)' }}>
            {['ALL', 'GST', 'BANK', 'Invoices', 'Others'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ padding: 'var(--spacing-1) var(--spacing-3)', border: 'none', background: activeTab === tab ? 'var(--color-navy-50)' : 'none', color: activeTab === tab ? 'var(--color-navy-700)' : 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', cursor: 'pointer' }}
              >
                {tab === 'BANK' ? 'Bank Statements' : tab}
              </button>
            ))}
          </div>

          {/* Files Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-xs)' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-2)' }}>
                <th style={{ padding: 'var(--spacing-2) 0' }}>File Name</th>
                <th style={{ padding: 'var(--spacing-2) 0' }}>Category</th>
                <th style={{ padding: 'var(--spacing-2) 0' }}>Size</th>
                <th style={{ padding: 'var(--spacing-2) 0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 'var(--spacing-4) 0', color: 'var(--text-secondary)' }}>No files uploaded in this category.</td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.documentId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: 'var(--spacing-3) 0', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{doc.fileName}</td>
                    <td style={{ padding: 'var(--spacing-3) 0', color: 'var(--text-secondary)' }}>{doc.sourceType}</td>
                    <td style={{ padding: 'var(--spacing-3) 0', color: 'var(--text-secondary)' }}>{(doc.size / (1024 * 1024)).toFixed(1)} MB</td>
                    <td style={{ padding: 'var(--spacing-3) 0', color: 'var(--color-positive)', fontWeight: 'var(--font-weight-semibold)' }}>Uploaded</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Missing Info Panels */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>Missing / Incomplete Information</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-3)', backgroundColor: 'rgba(200, 32, 47, 0.03)', borderLeft: '3px solid var(--color-red-600)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>EPFO / Payroll Data</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>Not provided by applicant.</div>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-red-600)', backgroundColor: 'var(--color-red-50)', padding: '1px 6px', borderRadius: '4px', height: 'fit-content', fontWeight: 'var(--font-weight-bold)' }}>HIGH</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-3)', backgroundColor: 'rgba(212, 160, 23, 0.03)', borderLeft: '3px solid var(--color-amber-500)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>Income Tax Returns</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>Last ITR available for FY23.</div>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-amber-600)', backgroundColor: 'var(--color-amber-50)', padding: '1px 6px', borderRadius: '4px', height: 'fit-content', fontWeight: 'var(--font-weight-bold)' }}>MEDIUM</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-3)', backgroundColor: 'rgba(212, 160, 23, 0.03)', borderLeft: '3px solid var(--color-amber-500)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>Supplier Invoices</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>Limited invoice support uploaded.</div>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-amber-600)', backgroundColor: 'var(--color-amber-50)', padding: '1px 6px', borderRadius: '4px', height: 'fit-content', fontWeight: 'var(--font-weight-bold)' }}>MEDIUM</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-3)', backgroundColor: 'rgba(10, 29, 58, 0.03)', borderLeft: '3px solid var(--color-navy-300)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>Utility Bills</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>Only 2 months utility bills available.</div>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-navy-500)', backgroundColor: 'var(--color-navy-50)', padding: '1px 6px', borderRadius: '4px', height: 'fit-content', fontWeight: 'var(--font-weight-bold)' }}>LOW</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Process Wizard / Progress Timeline */}
      <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5) var(--spacing-6)' }}>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', marginBottom: 'var(--spacing-4)' }}>What's Next?</div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          {/* Horizontal Line background */}
          <div style={{ position: 'absolute', left: '10%', right: '10%', top: '15px', height: '2px', backgroundColor: 'var(--border-color)', zIndex: 1 }} />

          {[
            { step: '1', label: 'Raw Data Review', desc: 'Verify incoming files', active: true, done: false },
            { step: '2', label: 'Pipeline Execution', desc: 'Process observations', active: false, done: false },
            { step: '3', label: 'Evidence Repository', desc: 'Review extracted indicators', active: false, done: false },
            { step: '4', label: 'Financial Health Card', desc: 'Generate overall health score', active: false, done: false },
            { step: '5', label: 'Explainability & Decision', desc: 'Drill down & submit choice', active: false, done: false }
          ].map((st, idx) => (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 2 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: st.active ? 'var(--color-teal-600)' : 'var(--bg-primary)', border: st.active ? 'none' : '2px solid var(--border-color)', color: st.active ? 'var(--color-white)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)' }}>
                {st.step}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', color: st.active ? 'var(--color-teal-600)' : 'var(--text-primary)', marginTop: 'var(--spacing-2)' }}>{st.label}</div>
              <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{st.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
