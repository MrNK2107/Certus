'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export interface NavItem {
  label: string;
  href: string;
  iconType?: string;
  disabled?: boolean;
}

interface SidebarProps {
  title: string;
  items: NavItem[];
  onNavigate?: (href: string) => void;
}

// Map icon types to SVGs
const renderIcon = (type: string) => {
  const props = { stroke: 'currentColor', strokeWidth: 2, fill: 'none', width: 18, height: 18 };
  switch (type) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case 'queue':
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'overview':
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'pipeline':
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17m0 0V4m0 4h4" />
        </svg>
      );
    case 'evidence':
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
        </svg>
      );
    case 'fhc':
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'explain':
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case 'decision':
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'logs':
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

export function Sidebar({ title, items, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.sidebarHeader}>
        <span className={styles.moduleTag}>MODULES</span>
      </div>
      <ul className={styles.list}>
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/app/dashboard' && item.href !== '/app/queue' && pathname.startsWith(item.href));
          
          if (item.disabled) {
            return (
              <li key={item.label} className={styles.item}>
                <div className={`${styles.link} ${styles.disabled}`} title="Select a case from the queue first">
                  <span className={styles.icon}>{renderIcon(item.iconType || '')}</span>
                  <span className={styles.label}>{item.label}</span>
                  <span className={styles.lockIcon}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="12" height="12">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                </div>
              </li>
            );
          }

          return (
            <li key={item.label} className={styles.item}>
              <Link
                href={item.href}
                className={`${styles.link} ${isActive ? styles.active : ''}`}
                onClick={() => onNavigate && onNavigate(item.href)}
              >
                <span className={styles.icon}>{renderIcon(item.iconType || '')}</span>
                <span className={styles.label}>{item.label}</span>
                {isActive && <span className={styles.indicator} />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
