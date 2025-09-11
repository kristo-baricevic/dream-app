// src/redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import journalReducer from './slices/journalSlice';
import analysisReducer from './slices/analysisSlice';

const rootReducer = combineReducers({
  journal: journalReducer,
  analysis: analysisReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
