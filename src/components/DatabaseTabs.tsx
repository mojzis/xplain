import { clsx } from 'clsx';
import type { DatabaseType } from '../types/plan';

interface DatabaseTabsProps {
  selected: DatabaseType;
  onChange: (type: DatabaseType) => void;
}

const TABS: { type: DatabaseType; label: string }[] = [
  { type: 'sqlserver', label: 'SQL Server' },
  { type: 'postgresql', label: 'PostgreSQL' },
  { type: 'oracle', label: 'Oracle' },
];

export function DatabaseTabs({ selected, onChange }: DatabaseTabsProps) {
  return (
    <div className="flex gap-1 border-b border-gray-200">
      {TABS.map(({ type, label }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={clsx(
            'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            selected === type
              ? 'bg-white text-blue-600 border border-b-white border-gray-200 -mb-px'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
