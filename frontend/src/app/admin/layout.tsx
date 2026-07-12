'use client';

import { useState } from 'react';
import { AppShell, Sidebar, TopHeader } from '@/components/layout';
import type { NavItem } from '@/components/layout';

const adminNavItems: NavItem[] = [
  { label: 'Overview', href: '/admin' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Roles', href: '/admin/roles' },
  { label: 'Permissions', href: '/admin/permissions' },
  { label: 'Branches', href: '/admin/branches' },
  { label: 'Teams', href: '/admin/teams' },
  { label: 'Limits', href: '/admin/limits' },
  { label: 'Settings', href: '/admin/settings' },
  { label: 'Integrations', href: '/admin/integrations' },
  { label: 'Feature Flags', href: '/admin/feature-flags' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState('');

  const navItems = adminNavItems.map((item) => ({
    ...item,
    active: currentPath.startsWith(item.href),
  }));

  return (
    <AppShell
      sidebar={
        <Sidebar title="Admin Console" items={navItems} onNavigate={(href) => setCurrentPath(href)} />
      }
      header={<TopHeader title="Administration" subtitle="Platform Management" userInfo={<span>Admin</span>} />}
    >
      {children}
    </AppShell>
  );
}
