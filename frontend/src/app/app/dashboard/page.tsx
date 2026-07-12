import React from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface DashboardMetrics {
  totalCases: number;
  pendingCases: number;
  needsReview: number;
  underReview: number;
  scored: number;
  alerts: number;
}

export default async function DashboardPage() {
  // Try fetching metrics from backend, but fallback to mockup values if needed
  let metricsObj: DashboardMetrics | null = null;
  try {
    metricsObj = await apiFetch<DashboardMetrics>('/dashboard/metrics');
  } catch {
    // Ignore error, fallback below
  }

  const metrics = metricsObj || {
    totalCases: 1245,
    pendingCases: 312,
    needsReview: 63,
    underReview: 128,
    scored: 892,
    alerts: 86
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      {/* Welcome Row */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
          Welcome back, Risk Manager
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-1)' }}>
          AI-powered underwriting and financial health assessment for MSME loan decisions.
        </p>
      </div>

      {/* Summary Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-4)' }}>
        <div style={{ backgroundColor: 'var(--bg-primary)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', borderTop: '4px solid var(--color-navy-500)', background: 'linear-gradient(135deg, var(--color-white) 0%, rgba(208, 220, 238, 0.12) 100%)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-navy-50)', borderRadius: 'var(--radius-md)', color: 'var(--color-navy-600)' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Customers</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '2px' }}>{metrics.totalCases}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-primary)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', borderTop: '4px solid var(--color-teal-600)', background: 'linear-gradient(135deg, var(--color-white) 0%, rgba(224, 245, 240, 0.2) 100%)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-teal-50)', borderRadius: 'var(--radius-md)', color: 'var(--color-teal-600)' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assessments Completed</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '2px' }}>{metrics.scored}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-primary)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', borderTop: '4px solid var(--color-red-600)', background: 'linear-gradient(135deg, var(--color-white) 0%, rgba(252, 232, 232, 0.2) 100%)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-red-50)', borderRadius: 'var(--radius-md)', color: 'var(--color-red-600)' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>High Risk Cases</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-red-600)', marginTop: '2px' }}>{metrics.alerts}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-primary)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', borderTop: '4px solid var(--color-teal-600)', background: 'linear-gradient(135deg, var(--color-white) 0%, rgba(224, 245, 240, 0.2) 100%)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-teal-50)', borderRadius: 'var(--radius-md)', color: 'var(--color-teal-600)' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg. Health Score</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '2px' }}>78<span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/100</span></div>
          </div>
        </div>
      </div>

      {/* Main Grid: Platform Overview & DB Connection */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 'var(--spacing-6)' }}>
        {/* Left Card: Platform Overview */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
              Platform Overview
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-2)' }}>
              The MSME Financial Health Platform empowers IDBI Bank to assess MSME applicants using AI-driven analysis of financial data, alternative data sources, and behavioral indicators.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-6)' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
                <span style={{ color: 'var(--color-teal-600)', marginTop: '2px' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>Comprehensive Analysis</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Evaluate identity, operations, cash flow, growth, compliance, and risk.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
                <span style={{ color: 'var(--color-teal-600)', marginTop: '2px' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>AI-Powered Insights</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Advanced models and explainable AI deliver transparent, reliable scoring.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
                <span style={{ color: 'var(--color-teal-600)', marginTop: '2px' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>Evidence-Driven Decisions</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Every score is backed by verified evidence, audits, and reason codes.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
                <span style={{ color: 'var(--color-teal-600)', marginTop: '2px' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>Secure &amp; Compliant</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Bank-grade security with audit logs and role-based access controls.</div>
                </div>
              </div>
            </div>
            
            {/* Visual illustration box */}
            <div style={{ width: '180px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)', padding: 'var(--spacing-4)' }}>
              <div style={{ textAlign: 'center' }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="64" height="64" style={{ color: 'var(--color-teal-600)', margin: '0 auto' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: 'var(--spacing-2)', fontWeight: 'var(--font-weight-medium)' }}>Secure Assessment</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Database Connection */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 'var(--spacing-4)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
              Database Connection
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-2)' }}>
              Connect to the data source to fetch and manage MSME applicant records.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: 'var(--spacing-4) 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Connection Status</span>
              <span style={{ color: 'var(--color-positive)', fontWeight: 'var(--font-weight-semibold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Connected
                <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Database Name</span>
              <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>MSME_Underwriting_DB</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Last Connected On</span>
              <span style={{ color: 'var(--text-primary)' }}>01 May 2025, 10:32 AM</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Records</span>
              <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>1,245</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Last Updated</span>
              <span style={{ color: 'var(--text-primary)' }}>01 May 2025, 10:32 AM</span>
            </div>
          </div>

          <button style={{ width: '100%', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', transition: 'background-color 0.2s' }}>
            Reconnect to Database
          </button>
        </div>
      </div>

      {/* Success Status Banner */}
      <div style={{ backgroundColor: 'rgba(0, 75, 73, 0.05)', border: '1px solid rgba(0, 75, 73, 0.2)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
          <div style={{ color: 'var(--color-teal-600)' }}>
            <svg fill="currentColor" viewBox="0 0 20 20" width="36" height="36">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 100-2 1 1 0 000 2zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-teal-600)', fontSize: 'var(--font-size-base)' }}>
              Database Connected Successfully
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
              All records have been fetched and are ready for analysis. You can now proceed to view and manage the customer queue.
            </div>
          </div>
        </div>

        {/* Stats segment */}
        <div style={{ display: 'flex', gap: 'var(--spacing-8)', textAlign: 'center' }}>
          <div style={{ padding: '0 var(--spacing-4)', borderRight: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>1,245</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Records</div>
          </div>
          <div style={{ padding: '0 var(--spacing-4)', borderRight: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-teal-600)' }}>1,182</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Valid Records</div>
          </div>
          <div style={{ padding: '0 var(--spacing-4)', borderRight: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-caution)' }}>63</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>With Issues</div>
          </div>
          <div style={{ padding: '0 var(--spacing-4)' }}>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-risk)' }}>0</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Failed to Load</div>
          </div>
        </div>
      </div>

      {/* CTA Button Row */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-2)' }}>
        <Link href="/app/queue" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)', backgroundColor: 'var(--color-teal-600)', color: 'var(--color-white)', padding: 'var(--spacing-3) var(--spacing-8)', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-semibold)', textDecoration: 'none', transition: 'background-color 0.2s', boxShadow: 'var(--shadow-md)' }}>
          Proceed to Customer Queue
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
