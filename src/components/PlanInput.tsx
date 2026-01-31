import { useState, useCallback, useRef } from 'react';
import { clsx } from 'clsx';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result;
          if (typeof content === 'string') {
            setInput(content);
            setError(null);
            const detected = detectPlanType(content);
            if (detected) {
              setSelectedDb(detected);
            }
          }
        };
        reader.onerror = () => {
          setError('Failed to read file');
        };
        reader.readAsText(file);
      }
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result;
          if (typeof content === 'string') {
            setInput(content);
            setError(null);
            const detected = detectPlanType(content);
            if (detected) {
              setSelectedDb(detected);
            }
          }
        };
        reader.onerror = () => {
          setError('Failed to read file');
        };
        reader.readAsText(file);
      }
      // Reset input so the same file can be selected again
      e.target.value = '';
    },
    []
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInput(value);
      setError(null);

      // Auto-detect on paste
      if (value.length > 100) {
        const detected = detectPlanType(value);
        if (detected) {
          setSelectedDb(detected);
        }
      }
    },
    []
  );

  const placeholder = getPlaceholder(selectedDb);

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
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full h-64 p-4 pb-12 font-mono text-sm resize-none focus:outline-none bg-transparent"
          spellCheck={false}
        />
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-sm text-gray-500">
          <span>Paste, drag & drop, or upload a file</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
          >
            Browse files...
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".sqlplan,.xml,.json,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80 pointer-events-none">
            <p className="text-blue-600 font-medium">Drop file here</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleParse}
        disabled={!input.trim()}
        className={clsx(
          'px-4 py-2 rounded-lg font-medium transition-colors',
          input.trim()
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        )}
      >
        Visualize Plan
      </button>
    </div>
  );
}

function getPlaceholder(db: DatabaseType): string {
  switch (db) {
    case 'sqlserver':
      return 'Paste SQL Server execution plan XML here, or drag and drop a .sqlplan file...\n\nGet plan with: SET STATISTICS XML ON; <your query>';
    case 'postgresql':
      return 'Paste PostgreSQL execution plan JSON here...\n\nGet plan with: EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) <your query>';
    case 'oracle':
      return 'Paste Oracle execution plan text here...\n\nGet plan with: SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR());';
  }
}
