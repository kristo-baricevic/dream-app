// components/WorkflowViewer.tsx

'use client';

import React, { useEffect, useState } from 'react';
import {
  selectCurrentWorkflow,
  selectExpandedSteps,
  toggleStepExpanded,
} from '@/redux/slices/workflowSlice';
import { AppDispatch } from 'recharts/types/state/store';
import { useDispatch, useSelector } from 'react-redux';

type WorkflowViewerProps = {
  response: any;
};

export const WorkflowViewer: React.FC<WorkflowViewerProps> = ({ response }) => {
  const dispatch = useDispatch<AppDispatch>();
  const workflow = useSelector(selectCurrentWorkflow);
  const expandedSteps = useSelector(selectExpandedSteps);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!response) return;
    setCollapsed(true);
  }, [response]);

  if (!workflow) {
    return <div className="p-4 text-gray-500">No workflow data</div>;
  }

  const isStepExpanded = (stepId: string) => expandedSteps.includes(stepId);

  return (
    <div className="workflow-viewer space-y-4">
      {/* Header */}
      <div className="bg-slate-100 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{workflow.routine_name}</h3>
            <p className="text-sm text-gray-600">
              {workflow.status === 'running' && '⏳ Analysis in progress...'}
              {workflow.status === 'completed' && '✅ Analysis complete'}
              {workflow.status === 'failed' && '❌ Analysis failed'}
            </p>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="bg-white text-sm px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-300 transition"
          >
            {collapsed ? 'Expand Viewer' : 'Collapse Viewer'}
          </button>
        </div>
      </div>
      {!collapsed && (
        <>
          {/* Steps */}
          <div className="space-y-3">
            {workflow.steps.map((step, index) => (
              <div key={step.id} className="border rounded-lg overflow-hidden">
                <div
                  className="p-4 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => dispatch(toggleStepExpanded(step.id))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold">
                        {step.step_number}
                      </div>
                      <div>
                        <h4 className="font-medium">{step.name}</h4>
                        {step.duration_ms && (
                          <p className="text-sm text-gray-500">{step.duration_ms}ms</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {step.confidence && (
                        <span className="text-sm text-gray-600">
                          {(step.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                      <StepStatusIcon status={step.status} />
                    </div>
                  </div>
                </div>

                {isStepExpanded(step.id) && (
                  <div className="p-4 bg-gray-50 border-t">
                    {step.reasoning && (
                      <div className="mb-4">
                        <h5 className="font-medium text-sm text-gray-700 mb-1">Reasoning</h5>
                        <p className="text-sm text-gray-600">{step.reasoning}</p>
                      </div>
                    )}

                    {step.citations.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm text-gray-700">Sources</h5>
                        {step.citations.map((citation, idx) => (
                          <div key={idx} className="bg-white p-3 rounded border">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-green-600">
                                    {formatSourceName(citation.source)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{citation.content}</p>
                              </div>
                              <span className="text-xs text-gray-500 ml-2">
                                {(citation.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Final Result */}
          {workflow.status === 'completed' && workflow.final_result && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              {/* <h3 className="font-semibold mb-2">Interpretation</h3>
          <p className="text-gray-800 whitespace-pre-wrap">{workflow.final_result}</p> */}

              {workflow.overall_confidence && (
                <div className="text-sm text-gray-600 mt-3">
                  Confidence: {(workflow.overall_confidence * 100).toFixed(0)}%
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const StepStatusIcon: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'completed') return <span className="text-green-600">✓</span>;
  if (status === 'running') return <span className="text-blue-600 animate-spin">⏳</span>;
  if (status === 'failed') return <span className="text-red-600">✗</span>;
  return <span className="text-gray-400">○</span>;
};

const formatSourceName = (source: string): string => {
  const names: Record<string, string> = {
    dream_science_papers: 'Dream Science',
    natal_chart: 'Astrology',
    personality_type: 'Personality',
    jungian_symbols: 'Jungian Symbols',
  };
  return names[source] || source;
};
