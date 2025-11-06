import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export type SymbolCount = { symbol: string; count: number };

type ChartsPageData = {
  symbols: SymbolCount[];
  loading: boolean;
  error: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const initialState: ChartsPageData = {
  symbols: [],
  loading: false,
  error: null,
};

export const fetchAllSymbols = createAsyncThunk<SymbolCount[]>(
  'charts/fetchAllSymbols',
  async () => {
    const res = await fetch(`${API_URL}/api/symbols/`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch symbols');
    return res.json();
  }
);

const chartsSlice = createSlice({
  name: 'charts',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAllSymbols.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    b.addCase(fetchAllSymbols.fulfilled, (state, action: PayloadAction<SymbolCount[]>) => {
      state.loading = false;
      state.symbols = action.payload;
    });
    b.addCase(fetchAllSymbols.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch symbols';
    });
  },
});

export default chartsSlice.reducer;

export const selectSymbolCounts = (s: { charts: ChartsPageData }) => s.charts.symbols;
export const selectSymbolStrings = (s: { charts: ChartsPageData }) =>
  s.charts.symbols.map((x) => x.symbol);
