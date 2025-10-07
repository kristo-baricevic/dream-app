// src/redux/slices/analysisSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AnalysisData, CumulativeAnalysisData } from '@/types';

type AnalysisState = {
  items: CumulativeAnalysisData[];
  loading: boolean;
  error: string | null;
  count: number;
  next: string | null;
  previous: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const FAST_API_URL = process.env.NEXT_PUBLIC_FAST_API_URL as string;

type PaginatedResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: CumulativeAnalysisData[];
};
type SearchParams = {
  page?: number;
  pageSize?: number;
  doctor_personality?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
};

const initialState: AnalysisState = {
  items: [],
  loading: false,
  error: null,
  count: 0,
  next: null,
  previous: null,
};

const entriesUrlFrom = (nextUrl: string) => {
  const u = new URL(nextUrl, API_URL);
  return `${API_URL}/api/entries/?${u.searchParams.toString()}`;
};

export const fetchAllAnalyses = createAsyncThunk<PaginatedResponse, SearchParams>(
  'analysis/fetchAll',
  async (params: SearchParams = {}) => {
    const { page = 1, pageSize = 10, ...filters } = params;

    const query = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
      ),
    });

    const res = await fetch(`${API_URL}/api/cumulative-analyses/?${query.toString()}`, {
      credentials: 'include',
    });
    console.log('Response status:', res.status);

    if (!res.ok) throw new Error('Failed to fetch analyses');
    return res.json();
  }
);

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setAnalyses: (state, action: PayloadAction<CumulativeAnalysisData[]>) => {
      state.items = action.payload;
    },
    addAnalysis: (state, action: PayloadAction<CumulativeAnalysisData>) => {
      state.items.push(action.payload);
    },
    updateAnalysis: (state, action: PayloadAction<CumulativeAnalysisData>) => {
      const index = state.items.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteAnalysis: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((a) => a.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAnalyses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAnalyses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(fetchAllAnalyses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setAnalyses, addAnalysis, updateAnalysis, deleteAnalysis, clearError } =
  analysisSlice.actions;
export default analysisSlice.reducer;
