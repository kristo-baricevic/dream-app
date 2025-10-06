// src/redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import journalReducer from './slices/journalSlice';
import analysisReducer from './slices/analysisSlice';
import playlistReducer from './slices/playlistSlice';
import settingsReducer from './slices/settingsSlice';

const rootReducer = combineReducers({
  journal: journalReducer,
  analysis: analysisReducer,
  playlist: playlistReducer,
  settings: settingsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
