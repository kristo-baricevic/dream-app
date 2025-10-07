import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CustomQuestionData } from '@/types';

type CustomQuestionState = {
  items: CustomQuestionData[];
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
  results: CustomQuestionData[];
};

type SearchParams = {
  page?: number;
  pageSize?: number;
  doctor_personality?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
};

const initialState: CustomQuestionState = {
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

export const fetchAllCustomQuestions = createAsyncThunk<PaginatedResponse, SearchParams>(
  'customQuestion/fetchAll',
  async (params: SearchParams = {}) => {
    const { page = 1, pageSize = 10, ...filters } = params;

    const query = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
      ),
    });

    const res = await fetch(`${API_URL}/api/custom-questions/?${query.toString()}`, {
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Failed to fetch analyses');
    return res.json();
  }
);

const customQuestionSlice = createSlice({
  name: 'customQuestion',
  initialState,
  reducers: {
    setCustomQuestions: (state, action: PayloadAction<CustomQuestionData[]>) => {
      state.items = action.payload;
    },
    addCustomQuestion: (state, action: PayloadAction<CustomQuestionData>) => {
      state.items.push(action.payload);
    },
    updateCustomQuestion: (state, action: PayloadAction<CustomQuestionData>) => {
      const index = state.items.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteCustomQuestion: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((a) => a.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCustomQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCustomQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(fetchAllCustomQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCustomQuestions,
  addCustomQuestion,
  updateCustomQuestion,
  deleteCustomQuestion,
  clearError,
} = customQuestionSlice.actions;
export default customQuestionSlice.reducer;
