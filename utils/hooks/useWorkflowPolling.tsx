'use client';

import { useEffect, useRef } from 'react';
import { AppDispatch } from '@/redux/store';
import {
  fetchWorkflowExecution,
  selectIsPolling,
  selectCurrentWorkflow,
} from '@/redux/slices/workflowSlice';
import { useDispatch, useSelector } from 'react-redux';

export const useWorkflowPolling = (
  workflowId: string | null,
  onComplete?: (result: string, analysisId?: string) => void
) => {
  const dispatch = useDispatch<AppDispatch>();
  const isPolling = useSelector(selectIsPolling);
  const currentWorkflow = useSelector(selectCurrentWorkflow);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  const analysisId = currentWorkflow?.analysis_id ?? null;

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    console.log('🔍 Polling hook state:', { workflowId, isPolling });

    if (!workflowId || !isPolling) {
      console.log('⏸️ Not polling:', { hasWorkflowId: !!workflowId, isPolling });
      return;
    }

    console.log('🚀 Starting to poll workflow:', workflowId);

    // Poll immediately - NO DELAY
    dispatch(fetchWorkflowExecution(workflowId));

    // Then poll every 100ms (was 500ms - TOO SLOW)
    intervalRef.current = setInterval(() => {
      console.log('📡 Polling...');
      dispatch(fetchWorkflowExecution(workflowId));
    }, 250); // <-- Polling interval

    return () => {
      if (intervalRef.current) {
        console.log('🛑 Stopping polling');
        clearInterval(intervalRef.current);
      }
    };
  }, [workflowId, isPolling, dispatch]);

  // Call onComplete when workflow finishes
  useEffect(() => {
    if (
      currentWorkflow?.status === 'completed' &&
      currentWorkflow.final_result &&
      onCompleteRef.current
    ) {
      onCompleteRef.current(currentWorkflow.final_result, analysisId ?? undefined);
    }
  }, [currentWorkflow?.status, currentWorkflow?.final_result, analysisId]);

  return analysisId;
};
