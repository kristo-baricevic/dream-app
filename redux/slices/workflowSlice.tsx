import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Citation {
  source: string;
  content: string;
  confidence: number;
  reference?: string;
}

export interface WorkflowStep {
  id: string;
  step_number: number;
  name: string;
  step_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration_ms?: number;
  confidence?: number;
  reasoning?: string;
  model_used?: string;
  citations: Citation[];
}

export interface WorkflowExecution {
  id: string;
  workflow_type: string;
  routine_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  start_time: string;
  end_time?: string;
  final_result?: string;
  overall_confidence?: number;
  total_citations: number;
  steps: WorkflowStep[];
  analysis_id: string;
}

interface WorkflowState {
  currentWorkflow: WorkflowExecution | null;
  isPolling: boolean;
  isLoading: boolean;
  error: string | null;
  expandedSteps: string[]; // Track which steps are expanded in UI
}

const initialState: WorkflowState = {
  currentWorkflow: null,
  isPolling: false,
  isLoading: false,
  error: null,
  expandedSteps: [],
};

const local = false;

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const FAST_API_URL = process.env.NEXT_PUBLIC_FAST_API_URL;

export const analyzeDreamsWithWorkflow = createAsyncThunk(
  'workflow/analyzeDreams',
  async (params: { entries: any[]; settings?: any }) => {
    const URL = local ? `${FAST_API_URL}/qa-with-workflow` : `${API_URL}/fastapi/qa-with-workflow`;
    console.log('🔍 Starting workflow request...');

    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Analysis failed');
    }

    const data = await response.json();
    return data;
  }
);

export const askCustomQuestionWithWorkflow = createAsyncThunk(
  'workflow/askQuestion',
  async (params: { question: string; entries: any[]; settings?: any }) => {
    const URL = local
      ? `${FAST_API_URL}/custom-question-with-workflow`
      : `${API_URL}/fastapi/custom-question-with-workflow`;

    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Question failed');
    }

    const data = await response.json();
    return data;
  }
);

export const fetchWorkflowExecution = createAsyncThunk(
  'workflow/fetchExecution',
  async (workflowId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/workflows/${workflowId}/`);
    if (!response.ok) throw new Error('Failed to fetch workflow');
    return response.json();
  }
);

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    setCurrentWorkflow: (state, action: PayloadAction<WorkflowExecution>) => {
      state.currentWorkflow = action.payload;
    },
    clearCurrentWorkflow: (state) => {
      state.currentWorkflow = null;
      state.isPolling = false;
      state.expandedSteps = [];
    },
    setPolling: (state, action: PayloadAction<boolean>) => {
      state.isPolling = action.payload;
    },
    toggleStepExpanded: (state, action: PayloadAction<string>) => {
      const stepId = action.payload;
      const index = state.expandedSteps.indexOf(stepId);

      if (index > -1) {
        state.expandedSteps.splice(index, 1);
      } else {
        state.expandedSteps.push(stepId);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeDreamsWithWorkflow.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(analyzeDreamsWithWorkflow.fulfilled, (state, action) => {
        console.log('🟢 REDUCER: analyzeDreamsWithWorkflow.fulfilled called');
        console.log('🟢 REDUCER: Setting isPolling to TRUE');
        state.isLoading = false;
        state.isPolling = true;
        console.log('🟢 REDUCER: isPolling is now:', state.isPolling);
      })
      .addCase(analyzeDreamsWithWorkflow.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Analysis failed';
      });
    builder
      .addCase(askCustomQuestionWithWorkflow.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(askCustomQuestionWithWorkflow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isPolling = true;
      })
      .addCase(askCustomQuestionWithWorkflow.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Question failed';
      });

    builder
      .addCase(fetchWorkflowExecution.fulfilled, (state, action) => {
        console.log('📦 Workflow payload received:', {
          status: action.payload.status,
          id: action.payload.id,
          isPolling_before: state.isPolling,
        });

        state.currentWorkflow = action.payload;

        // Stop polling if workflow is completed or failed
        if (action.payload.status === 'completed' || action.payload.status === 'failed') {
          console.log('🛑 STOPPING POLLING - Status is:', action.payload.status);
          state.isPolling = false;
          console.log('🛑 isPolling set to:', state.isPolling);
        } else {
          console.log('⏳ Still polling - Status is:', action.payload.status);
        }
      })
      .addCase(fetchWorkflowExecution.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch workflow';
        state.isPolling = false;
      });
  },
});

export const {
  setCurrentWorkflow,
  clearCurrentWorkflow,
  setPolling,
  toggleStepExpanded,
  clearError,
} = workflowSlice.actions;

export default workflowSlice.reducer;

export const selectCurrentWorkflow = (state: { workflow: WorkflowState }) =>
  state.workflow.currentWorkflow;

export const selectIsPolling = (state: { workflow: WorkflowState }) => state.workflow.isPolling;

export const selectIsLoading = (state: { workflow: WorkflowState }) => state.workflow.isLoading;

export const selectError = (state: { workflow: WorkflowState }) => state.workflow.error;

export const selectExpandedSteps = (state: { workflow: WorkflowState }) =>
  state.workflow.expandedSteps;

export const selectIsWorkflowComplete = (state: { workflow: WorkflowState }) =>
  state.workflow.currentWorkflow?.status === 'completed';
