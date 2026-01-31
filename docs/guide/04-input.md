# Step 7: Plan Input Component

## Goal
Create a component for inputting query plans with:
- Database type tabs (SQL Server, PostgreSQL, Oracle)
- Textarea for pasting plans
- Drag-and-drop file support
- Error display

## 7.1 Database Tabs Component

Create `src/components/DatabaseTabs.tsx`:

```tsx
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
```

## 7.2 Plan Input Component

Create `src/components/PlanInput.tsx`:

```tsx
import { useState, useCallback } from 'react';
import type { DatabaseType, ParsedPlan } from '../types/plan';
import { parsePlan, detectPlanType } from '../parsers';
import { DatabaseTabs } from './DatabaseTabs';

interface PlanInputProps {
  onPlanParsed: (plan: ParsedPlan) => void;
}

export function PlanInput({ onPlanParsed }: PlanInputProps) {
  const [selectedDb, setSelectedDb] = useState<DatabaseType>('sqlserver');
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleParse = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter a query plan');
      return;
    }

    try {
      const detected = detectPlanType(input);
      const plan = parsePlan(input, detected ?? selectedDb);
      setError(null);
      onPlanParsed(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse plan');
    }
  }, [input, selectedDb, onPlanParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          setInput(content);
          // Auto-detect and set DB type
          const detected = detectPlanType(content);
          if (detected) {
            setSelectedDb(detected);
          }
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <DatabaseTabs selected={selectedDb} onChange={setSelectedDb} />

      <div
        className={clsx(
          'relative border-2 border-dashed rounded-lg transition-colors',
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Paste your ${selectedDb} execution plan here, or drag and drop a .sqlplan file...`}
          className="w-full h-64 p-4 font-mono text-sm resize-none focus:outline-none bg-transparent"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleParse}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Visualize Plan
      </button>
    </div>
  );
}
```

## Verification

```bash
bun run typecheck   # Should pass
bun dev             # Test component in browser
```

## Checklist
- [ ] Database tabs work
- [ ] Textarea accepts input
- [ ] Drag-and-drop works for files
- [ ] Error messages display correctly
- [ ] Auto-detection works on paste/drop
- [ ] Parse button triggers visualization
