// src/redux/slices/journalSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { JournalEntry } from '@/types';
import { EmotionType } from '@/utils/parameters/emotions';
import next from 'next';
import { RootState } from '../rootReducer';

const local = false;

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;
const FAST_API_URL = process.env.NEXT_PUBLIC_FAST_API_URL as string;

type PaginatedResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: JournalEntry[];
};

type JournalState = {
  entries: JournalEntry[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  loading: boolean;
  error: string | null;
  searchParams: SearchParams;
};

type SearchParams = Partial<{
  entries: string;
  title: string;
  moods: string;
  analysis: string;
  start_date: string;
  end_date: string;
  page: number;
  pageSize: number;
}>;

export const fetchEntries = createAsyncThunk<PaginatedResponse, SearchParams>(
  'journal/fetchEntries',
  async (params: SearchParams = {}) => {
    const { page = 1, pageSize = 10, ...filters } = params;

    const query = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
      ),
    });

    const res = await fetch(`${API_URL}/api/entries/?${query.toString()}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch entries');
    return res.json();
  }
);

export const fetchNextEntries = createAsyncThunk<PaginatedResponse, void, { state: RootState }>(
  'journal/fetchNextEntries',
  async (_m, { getState, rejectWithValue }) => {
    const state = getState();
    const nextUrl: string | null = state.journal.pagination.next;

    if (!nextUrl) return rejectWithValue('No next page');

    const res = await fetch(nextUrl, { credentials: 'include' });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch next page. Status: ${res.status}, Message: ${errorText}`);
    }

    return res.json();
  }
);

export const deleteEntryThunk = createAsyncThunk<string, string>(
  'journal/deleteEntry',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/api/entries/${id}/delete/`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to delete entry. Status: ${res.status}, Message: ${errorText}`);
      }

      return id;
    } catch (error: any) {
      console.error('Error deleting entry:', error);
      return rejectWithValue(error.message || 'Failed to delete entry');
    }
  }
);

export const createEntryThunk = createAsyncThunk<JournalEntry, string | void>(
  'journal/createEntry',
  async (content = 'New entry', { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/api/entries/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create entry');
      }

      const data = await res.json();
      console.log('New entry data:', data);
      return data as JournalEntry;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create entry');
    }
  }
);

export const updateEntryThunk = createAsyncThunk<
  JournalEntry,
  { id: string; content: string; personality: string; mood: EmotionType }
>('journal/updateEntry', async ({ id, content, personality, mood }) => {
  const res = await fetch(`${API_URL}/api/entries/${id}/update/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content, personality, mood }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to update entry');
  }

  return res.json();
});

const initialState: JournalState = {
  entries: [],
  pagination: {
    count: 0,
    next: null,
    previous: null,
    hasNext: false,
    hasPrevious: false,
  },
  loading: false,
  error: null,
  searchParams: {},
};

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    addEntry: (state, action: PayloadAction<JournalEntry>) => {
      state.entries.push(action.payload);
    },
    updateEntry: (state, action: PayloadAction<JournalEntry>) => {
      const index = state.entries.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.entries[index] = action.payload;
      }
    },
    deleteEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter((e) => e.id !== action.payload);
    },
    setSearchParams: (state, action: PayloadAction<Partial<SearchParams>>) => {
      state.searchParams = {
        ...state.searchParams,
        ...action.payload,
      };
    },
    clearSearchParams: (state) => {
      state.searchParams = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.results;
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
          hasNext: !!action.payload.next,
          hasPrevious: !!action.payload.previous,
        };
      })
      .addCase(fetchEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load entries';
      })
      .addCase(deleteEntryThunk.fulfilled, (state, action) => {
        state.entries = state.entries.filter((e) => e.id !== action.payload);
      })
      .addCase(deleteEntryThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(createEntryThunk.fulfilled, (state, action) => {
        state.entries.unshift(action.payload);
        state.pagination.count += 1;
      })
      .addCase(createEntryThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateEntryThunk.fulfilled, (state, action) => {
        const idx = state.entries.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.entries[idx] = action.payload;
      })
      .addCase(fetchNextEntries.fulfilled, (state, action) => {
        const incoming = action.payload.results;
        const existingIds = new Set(state.entries.map((e) => e.id));
        const merged = [...state.entries];

        for (const item of incoming) {
          if (!existingIds.has(item.id)) merged.push(item);
        }

        state.entries = merged;
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
          hasNext: !!action.payload.next,
          hasPrevious: !!action.payload.previous,
        };
      })
      .addCase(fetchNextEntries.rejected, (state, action) => {
        state.error =
          (action.payload as string) || action.error.message || 'Failed to fetch next page';
      });
  },
});

export const { addEntry, updateEntry, deleteEntry, setSearchParams, clearSearchParams } =
  journalSlice.actions;
export default journalSlice.reducer;
