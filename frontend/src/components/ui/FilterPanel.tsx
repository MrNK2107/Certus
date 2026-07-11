import styles from './FilterPanel.module.css';

export interface FilterDef {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'search';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterPanelProps {
  title?: string;
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear?: () => void;
}

export function FilterPanel({ title = 'Filters', filters, values, onChange, onClear }: FilterPanelProps) {
  const hasAnyValue = Object.values(values).some((v) => v.length > 0);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {hasAnyValue && onClear && (
          <button className={styles.clearButton} onClick={onClear} type="button">
            Clear all
          </button>
        )}
      </div>
      <div className={styles.filters}>
        {filters.map((def) => {
          if (def.type === 'search') {
            return (
              <div key={def.key} className={styles.searchWrapper}>
                <span className={styles.searchIcon}>&#x1F50D;</span>
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder={def.placeholder ?? 'Search...'}
                  value={values[def.key] ?? ''}
                  onChange={(e) => onChange(def.key, e.target.value)}
                />
              </div>
            );
          }

          if (def.type === 'select') {
            return (
              <div key={def.key} className={styles.field}>
                <label className={styles.label}>{def.label}</label>
                <select
                  className={styles.select}
                  value={values[def.key] ?? ''}
                  onChange={(e) => onChange(def.key, e.target.value)}
                >
                  <option value="">{def.placeholder ?? `All ${def.label}`}</option>
                  {def.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            );
          }

          if (def.type === 'date') {
            return (
              <div key={def.key} className={styles.field}>
                <label className={styles.label}>{def.label}</label>
                <input
                  className={styles.dateInput}
                  type="date"
                  value={values[def.key] ?? ''}
                  onChange={(e) => onChange(def.key, e.target.value)}
                />
              </div>
            );
          }

          return (
            <div key={def.key} className={styles.field}>
              <label className={styles.label}>{def.label}</label>
              <input
                className={styles.input}
                type="text"
                placeholder={def.placeholder}
                value={values[def.key] ?? ''}
                onChange={(e) => onChange(def.key, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
