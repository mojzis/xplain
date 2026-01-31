import { useState } from 'react';
import type { ParsedPlan } from './types/plan';
import { PlanInput } from './components/PlanInput';
import { PlanViewer } from './components/PlanViewer';

function App() {
  const [plan, setPlan] = useState<ParsedPlan | null>(null);

  if (plan) {
    return <PlanViewer plan={plan} onReset={() => setPlan(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Query Plan Visualizer
          </h1>
          <p className="mt-2 text-gray-600">
            Paste a SQL Server, PostgreSQL, or Oracle execution plan to visualize it.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            All processing happens in your browser — your data never leaves your machine.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <PlanInput onPlanParsed={setPlan} />
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          Supports SQL Server XML, PostgreSQL JSON, and Oracle text formats
        </div>
      </div>
    </div>
  );
}

export default App;
