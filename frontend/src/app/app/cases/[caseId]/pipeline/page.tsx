'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PipelineStage {
  name: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
  progress: number;
  startedOn?: string;
  duration?: string;
}

interface PipelineState {
  caseId: string;
  progress: number;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  stages: PipelineStage[];
  logs: { timestamp: string; message: string }[];
}

export default function PipelinePage({ params }: { params: Promise<{ caseId: string }> }) {
  const router = useRouter();
  const [caseId, setCaseId] = useState<string>('');
  const [pipelineState, setPipelineState] = useState<PipelineState | null>(null);
  const [businessName, setBusinessName] = useState('Applicant Business');

  useEffect(() => {
    params.then((p) => setCaseId(p.caseId));
  }, [params]);

  useEffect(() => {
    if (!caseId) return;

    // Fetch case info for footer
    async function fetchCaseInfo() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${baseUrl}/api/v1/cases/${caseId}`);
        if (res.ok) {
          const json = await res.json();
          setBusinessName(json.data.businessName);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchCaseInfo();

    // Trigger pipeline run
    async function startPipeline() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${baseUrl}/api/v1/cases/${caseId}/run-pipeline`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const json = await res.json();
          setPipelineState(json.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    startPipeline();

    // Poll pipeline status
    const pollInterval = setInterval(async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${baseUrl}/api/v1/cases/${caseId}/pipeline`);
        if (res.ok) {
          const json = await res.json();
          const state: PipelineState = json.data;
          setPipelineState(state);
          
          if (state.status === 'Completed') {
            clearInterval(pollInterval);
            // Wait 1.5s for visual closure, then redirect to Evidence Repository
            setTimeout(() => {
              router.push(`/app/cases/${caseId}/sources`);
            }, 1500);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 800);

    return () => clearInterval(pollInterval);
  }, [caseId, router]);

  if (!caseId || !pipelineState) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-secondary)' }}>Initializing ingestion pipeline...</div>;
  }

  // Determine completed stages count
  const completedStagesCount = pipelineState.stages.filter(s => s.status === 'Completed').length;
  
  // Find current running stage
  const runningStageIndex = pipelineState.stages.findIndex(s => s.status === 'In Progress');
  const runningStageNum = runningStageIndex !== -1 ? runningStageIndex + 1 : completedStagesCount;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      {/* Breadcrumbs & CTAs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}>
          <Link href="/app/queue" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Customer Queue</Link>
          <span style={{ color: 'var(--text-tertiary)' }}>/</span>
          <Link href={`/app/cases/${caseId}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{caseId} - {businessName}</Link>
          <span style={{ color: 'var(--text-tertiary)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-semibold)' }}>Pipeline Execution</span>
        </div>

        <button 
          onClick={() => router.push(`/app/cases/${caseId}`)}
          style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--color-risk)', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', cursor: 'pointer' }}
        >
          Cancel Execution
        </button>
      </div>

      {/* Main Grid: Summary Ring & Stages Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '4fr 8fr', gap: 'var(--spacing-6)' }}>
        
        {/* Left: Execution Summary */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-4)' }}>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', alignSelf: 'flex-start' }}>Execution Summary</h4>
          
          {/* Progress Circle Mockup */}
          <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'var(--spacing-4) 0' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="2.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--color-teal-600)"
                strokeDasharray={`${pipelineState.progress}, 100`}
                strokeWidth="2.8"
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>{pipelineState.progress}%</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'var(--font-weight-medium)' }}>Pipeline Progress</div>
              <div style={{ fontSize: '9px', color: 'var(--color-teal-600)', marginTop: '2px' }}>{completedStagesCount} of 8 stages done</div>
            </div>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Started On</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-semibold)' }}>01 May 2025, 10:35 AM</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Elapsed Time</span>
              <span style={{ color: 'var(--text-primary)' }}>00:04:32</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Estimated Time Left</span>
              <span style={{ color: 'var(--text-primary)' }}>{pipelineState.status === 'Completed' ? '00:00:00' : '00:02:21'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Pipeline Version</span>
              <span style={{ color: 'var(--text-primary)' }}>v2.3.1</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Triggered By</span>
              <span style={{ color: 'var(--text-primary)' }}>Risk Manager (Admin)</span>
            </div>
          </div>
        </div>

        {/* Right: Pipeline Stages Table */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5) var(--spacing-6)' }}>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)' }}>Pipeline Stages</h4>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-xs)' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: 'var(--spacing-2) 0' }}>Stage</th>
                <th style={{ padding: 'var(--spacing-2) 0' }}>Status</th>
                <th style={{ padding: 'var(--spacing-2) 0' }}>Progress</th>
                <th style={{ padding: 'var(--spacing-2) 0' }}>Started On</th>
                <th style={{ padding: 'var(--spacing-2) 0' }}>Duration</th>
              </tr>
            </thead>
            <tbody>
              {pipelineState.stages.map((st, idx) => {
                const isRunning = st.status === 'In Progress';
                const isCompleted = st.status === 'Completed';

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: isRunning ? 'rgba(0, 75, 73, 0.02)' : 'transparent' }}>
                    <td style={{ padding: 'var(--spacing-3) 0', fontWeight: 'var(--font-weight-semibold)', color: isRunning ? 'var(--color-teal-600)' : 'var(--text-primary)' }}>
                      {idx + 1}. {st.name}
                    </td>
                    <td style={{ padding: 'var(--spacing-3) 0' }}>
                      <span style={{ 
                        padding: '1px 6px', 
                        borderRadius: '4px', 
                        fontWeight: 'var(--font-weight-semibold)',
                        fontSize: '9px',
                        backgroundColor: isCompleted ? 'var(--color-teal-50)' : isRunning ? 'var(--color-blue-50)' : 'var(--bg-secondary)',
                        color: isCompleted ? 'var(--color-teal-600)' : isRunning ? 'var(--color-blue-600)' : 'var(--text-secondary)'
                      }}>
                        {st.status}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--spacing-3) 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${st.progress}%`, height: '100%', backgroundColor: isCompleted ? 'var(--color-teal-600)' : isRunning ? 'var(--color-blue-600)' : 'transparent', transition: 'width 0.2s' }} />
                        </div>
                        <span style={{ color: 'var(--text-secondary)' }}>{st.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--spacing-3) 0', color: 'var(--text-secondary)' }}>
                      {st.startedOn || '-'}
                    </td>
                    <td style={{ padding: 'var(--spacing-3) 0', color: 'var(--text-secondary)' }}>
                      {st.duration || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row: Live Logs & Active Stage Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '6fr 6fr', gap: 'var(--spacing-6)' }}>
        
        {/* Live Logs Terminal Console */}
        <div style={{ backgroundColor: 'var(--color-navy-900)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)', color: 'var(--color-navy-100)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 'var(--spacing-2)' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Live Logs</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-red-400)' }} />
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-amber-400)' }} />
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-teal-400)' }} />
            </div>
          </div>
          <div style={{ height: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
            {pipelineState.logs.map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                <span style={{ color: 'var(--color-teal-300)' }}>[{log.timestamp}]</span>
                <span>{log.message}</span>
              </div>
            ))}
            {pipelineState.status === 'Running' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-blue-300)' }}>
                <span className="dot-pulse" style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-blue-300)', borderRadius: '50%', display: 'inline-block' }} />
                <span>Running...</span>
              </div>
            )}
          </div>
        </div>

        {/* Stage Details (Live) Card */}
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-5)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>Stage Details (Live)</h4>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', justifyContent: 'center' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-teal-600)' }}>
                {runningStageNum}. {pipelineState.stages[runningStageIndex]?.name || 'Pipeline Processing Complete'}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {pipelineState.status === 'Completed' 
                  ? 'Pipeline complete. All documents parsed, resolved, features generated, and health score computed.' 
                  : 'Analyzing data, extracting normalized observations, and calculating confidence indexes...'}
              </div>
            </div>

            {/* Ingestion stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-2)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-3)', marginTop: 'var(--spacing-2)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>142</div>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Total Features</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-teal-600)' }}>{pipelineState.progress >= 50 ? 93 : 42}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Generated</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-secondary)' }}>{pipelineState.progress >= 50 ? 49 : 100}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Remaining</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-teal-600)' }}>92%</div>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Data Quality</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Pipeline Info Banner */}
      <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: 'var(--spacing-4) var(--spacing-5)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-6)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Customer ID: </span>
            <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>{caseId}</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Business Name: </span>
            <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>{businessName}</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Batch ID: </span>
            <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>BATCH_2025_05_01</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16" style={{ color: 'var(--color-teal-600)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {pipelineState.status === 'Completed' ? (
            <span style={{ color: 'var(--color-teal-600)', fontWeight: 'var(--font-weight-semibold)' }}>Pipeline execution completed. Redirecting...</span>
          ) : (
            <span>You will be redirected automatically once the pipeline completes.</span>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes blink {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        .dot-pulse {
          animation: blink 1.2s infinite;
        }
      `}</style>
    </div>
  );
}
