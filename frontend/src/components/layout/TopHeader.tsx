'use client';

import React from 'react';
import styles from './TopHeader.module.css';

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  userInfo?: React.ReactNode;
}

export function TopHeader({ title, subtitle, actions, userInfo }: TopHeaderProps) {
  return (
    <div className={styles.header}>
      {/* Left: IDBI Logo & Title */}
      <div className={styles.left}>
        <div className={styles.logoContainer}>
          <img src="/idbi_bank_logo.webp" alt="IDBI Bank" className={styles.logoImg} />
          <div className={styles.brandText}>
            <span className={styles.divider}>|</span>
            <span className={styles.platformText}>MSME Financial Health Platform</span>
          </div>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className={styles.center}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" className={styles.searchInput} placeholder="Search customers, sectors, status..." />
        </div>
      </div>

      {/* Right: Notifications & User profile */}
      <div className={styles.right}>
        {/* Notification Bell */}
        <div className={styles.notificationWrapper}>
          <svg className={styles.bellIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" width="22" height="22">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className={styles.badge}>12</span>
        </div>

        {/* User Info */}
        <div className={styles.userProfile}>
          <div className={styles.avatar}>RM</div>
          <span className={styles.userName}>Risk Manager</span>
          <svg className={styles.chevronIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" width="12" height="12">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
