// src/redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import journalReducer from './slices/journalSlice';
import analysisReducer from './slices/analysisSlice';
import playlistReducer from './slices/playlistSlice';

const rootReducer = combineReducers({
  journal: journalReducer,
  analysis: analysisReducer,
  playlist: playlistReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
