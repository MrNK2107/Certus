import styles from './AppShell.module.css';

interface AppShellProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  contextPanel?: React.ReactNode;
}

export function AppShell({ sidebar, header, children, contextPanel }: AppShellProps) {
  return (
    <div className={styles.shell}>
      {header && <header className={styles.header}>{header}</header>}
      <div className={styles.container}>
        {sidebar && <aside className={styles.sidebar}>{sidebar}</aside>}
        <div className={styles.mainWrapper}>
          <main className={styles.content}>{children}</main>
        </div>
        {contextPanel && <aside className={styles.contextPanel}>{contextPanel}</aside>}
      </div>
    </div>
  );
}
