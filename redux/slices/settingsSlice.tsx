import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Astrology = {
  sun: string;
  moon: string;
  rising: string;
};

export type MedicalHistory = {
  psychological: string[];
  physical: string[];
};

export type Settings = {
  astrology: Astrology;
  occupation: string;
  medicalHistory: MedicalHistory;
  personality: string;
  doctorPersonality: string;
};

type SettingsState = Settings;

const initialState: SettingsState = {
  astrology: {
    sun: '',
    moon: '',
    rising: '',
  },
  occupation: '',
  medicalHistory: {
    psychological: [],
    physical: [],
  },
  personality: '',
  doctorPersonality: '',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Settings>) => {
      state.astrology = action.payload.astrology;
      state.occupation = action.payload.occupation;
      state.medicalHistory = action.payload.medicalHistory;
      state.personality = action.payload.personality;
      state.doctorPersonality = action.payload.doctorPersonality;
    },
    setAstrology: (state, action: PayloadAction<Astrology>) => {
      state.astrology = action.payload;
    },
    setAstrologyField: (
      state,
      action: PayloadAction<{ field: keyof Astrology; value: string }>
    ) => {
      state.astrology[action.payload.field] = action.payload.value;
    },
    setOccupation: (state, action: PayloadAction<string>) => {
      state.occupation = action.payload;
    },
    setPersonality: (state, action: PayloadAction<string>) => {
      state.personality = action.payload;
    },
    setDoctorPersonality: (state, action: PayloadAction<string>) => {
      state.doctorPersonality = action.payload;
    },
    addPsychological: (state, action: PayloadAction<string>) => {
      state.medicalHistory.psychological.push(action.payload);
    },
    removePsychological: (state, action: PayloadAction<number>) => {
      state.medicalHistory.psychological.splice(action.payload, 1);
    },
    updatePsychological: (state, action: PayloadAction<{ index: number; value: string }>) => {
      state.medicalHistory.psychological[action.payload.index] = action.payload.value;
    },
    addPhysical: (state, action: PayloadAction<string>) => {
      state.medicalHistory.physical.push(action.payload);
    },
    removePhysical: (state, action: PayloadAction<number>) => {
      state.medicalHistory.physical.splice(action.payload, 1);
    },
    updatePhysical: (state, action: PayloadAction<{ index: number; value: string }>) => {
      state.medicalHistory.physical[action.payload.index] = action.payload.value;
    },
    setMedicalHistory: (state, action: PayloadAction<MedicalHistory>) => {
      state.medicalHistory = action.payload;
    },
    resetSettings: () => initialState,
  },
});

export const {
  setSettings,
  setAstrology,
  setAstrologyField,
  setOccupation,
  setPersonality,
  setDoctorPersonality,
  addPsychological,
  removePsychological,
  updatePsychological,
  addPhysical,
  removePhysical,
  updatePhysical,
  setMedicalHistory,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
