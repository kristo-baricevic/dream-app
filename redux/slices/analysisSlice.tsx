// src/redux/slices/analysisSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnalysisData } from '@/types';

type AnalysisState = {
  items: AnalysisData[];
};

const initialState: AnalysisState = {
  items: [],
};

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setAnalyses: (state, action: PayloadAction<AnalysisData[]>) => {
      state.items = action.payload;
    },
    addAnalysis: (state, action: PayloadAction<AnalysisData>) => {
      state.items.push(action.payload);
    },
    updateAnalysis: (state, action: PayloadAction<AnalysisData>) => {
      const index = state.items.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteAnalysis: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((a) => a.id !== action.payload);
    },
  },
});

export const { setAnalyses, addAnalysis, updateAnalysis, deleteAnalysis } = analysisSlice.actions;
export default analysisSlice.reducer;
