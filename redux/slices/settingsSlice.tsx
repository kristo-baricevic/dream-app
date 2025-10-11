import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
// const API_URL = 'http://localhost:8000';

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
  id?: string;
  astrology: Astrology;
  occupation: string;
  medicalHistory: MedicalHistory;
  personality: string;
  doctorPersonality: string;
  doctorImage: string;
  influence: {
    astrology: number;
    personality: number;
    medicalHistory: number;
    doctor: number;
  };
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
    psychological: [''],
    physical: [''],
  },
  personality: '',
  doctorPersonality: '',
  doctorImage: '',
  influence: {
    astrology: 0.15,
    personality: 0.15,
    medicalHistory: 0.1,
    doctor: 0.7,
  },
};

const doctorImages: Record<string, string> = {
  Academic: '/owl_images/owl1.png',
  Mystical: '/owl_images/owl2.png',
  Artistic: '/owl_images/owl3.png',
  Compassionate: '/owl_images/owl4.png',
  Scientific: '/owl_images/owl5.png',
};

export const fetchSettings = createAsyncThunk<Settings>(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/api/settings/`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      return data[0];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateSettings = createAsyncThunk<Settings, Partial<Settings>>(
  'settings/updateSettings',
  async (updatedSettings, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/api/settings/update/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedSettings),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      const data = await res.json();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

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
      state.doctorImage = action.payload.doctorImage;
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
      state.doctorImage = doctorImages[action.payload] || '';
      console.log('state.doctorImage ', state.doctorImage);
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
    setInfluence: (
      state,
      action: PayloadAction<{ field: keyof Settings['influence']; value: number }>
    ) => {
      state.influence[action.payload.field] = action.payload.value;
    },
    resetSettings: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      });
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
  setInfluence,
} = settingsSlice.actions;

export default settingsSlice.reducer;
