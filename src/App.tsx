import { useState } from 'react';
import type { ParsedPlan } from './types/plan';
import { PlanInput } from './components/PlanInput';

function App() {
  const [plan, setPlan] = useState<ParsedPlan | null>(null);

  if (plan) {
    // Temporary: show parsed plan info until visualization is implemented
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Query Plan Visualization
            </h1>
            <button
              onClick={() => setPlan(null)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            >
              New Plan
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Database:</span>
                <span className="ml-2 text-gray-800 capitalize">{plan.database}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Root Operation:</span>
                <span className="ml-2 text-gray-800">{plan.rootNode.operation}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Parse Time:</span>
                <span className="ml-2 text-gray-800">{plan.parseTime.toFixed(2)} ms</span>
              </div>
              {plan.statementText && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Statement:</span>
                  <pre className="mt-1 p-2 bg-gray-50 rounded text-sm font-mono overflow-x-auto">
                    {plan.statementText}
                  </pre>
                </div>
              )}
              <p className="text-sm text-gray-500 italic">
                Visualization coming in next steps...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
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
      </div>
    </div>
  );
}

export default App;
