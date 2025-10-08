// src/redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import journalReducer from './slices/journalSlice';
import analysisReducer from './slices/analysisSlice';
import playlistReducer from './slices/playlistSlice';
import settingsReducer from './slices/settingsSlice';
import customQuestionReducer from './slices/customQuestionSlice';
import workflowReducer from './slices/workflowSlice';

const rootReducer = combineReducers({
  journal: journalReducer,
  analysis: analysisReducer,
  playlist: playlistReducer,
  settings: settingsReducer,
  customQuestion: customQuestionReducer,
  workflow: workflowReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
