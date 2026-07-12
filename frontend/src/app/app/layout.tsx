'use client';

import { usePathname } from 'next/navigation';
import { AppShell, Sidebar, TopHeader } from '@/components/layout';
import type { NavItem } from '@/components/layout';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Extract caseId from pathname if present (e.g. /app/cases/CUST000123/...)
  const segments = pathname.split('/');
  const caseIndex = segments.indexOf('cases');
  const caseId = caseIndex !== -1 && segments[caseIndex + 1] ? segments[caseIndex + 1] : null;

  const hasCase = !!caseId;

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/app/dashboard', iconType: 'dashboard' },
    { label: 'Customer Queue', href: '/app/queue', iconType: 'queue' },
    
    // Case-specific modules
    { 
      label: 'Raw Applicant Overview', 
      href: hasCase ? `/app/cases/${caseId}` : '#', 
      iconType: 'overview',
      disabled: !hasCase 
    },
    { 
      label: 'Pipeline Execution', 
      href: hasCase ? `/app/cases/${caseId}/pipeline` : '#', 
      iconType: 'pipeline',
      disabled: !hasCase 
    },
    { 
      label: 'Evidence Repository', 
      href: hasCase ? `/app/cases/${caseId}/sources` : '#', 
      iconType: 'evidence',
      disabled: !hasCase 
    },
    { 
      label: 'Financial Health Card', 
      href: hasCase ? `/app/cases/${caseId}/fhc` : '#', 
      iconType: 'fhc',
      disabled: !hasCase 
    },
    { 
      label: 'Explainability', 
      href: hasCase ? `/app/cases/${caseId}/explanations` : '#', 
      iconType: 'explain',
      disabled: !hasCase 
    },
    { 
      label: 'Credit Decision', 
      href: hasCase ? `/app/cases/${caseId}/decision` : '#', 
      iconType: 'decision',
      disabled: !hasCase 
    }
  ];

  return (
    <AppShell
      sidebar={
        <Sidebar
          title="Lender Workspace"
          items={navItems}
        />
      }
      header={<TopHeader />}
    >
      {children}
    </AppShell>
  );
}
