import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export type Track = {
  track: number;
  artist: string;
  title: string;
};

export type Playlist = {
  playlist: Track[];
};

type PlaylistState = {
  items: Playlist | undefined;
};

const initialState: PlaylistState = {
  items: undefined,
};

const playlistSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    addSong: (state, action: PayloadAction<Omit<Track, 'track'>>) => {
      if (!state.items) {
        state.items = { playlist: [] };
      }

      const exists = state.items.playlist.some(
        (t) =>
          t.title.toLowerCase() === action.payload.title.toLowerCase() &&
          t.artist.toLowerCase() === action.payload.artist.toLowerCase()
      );

      if (!exists) {
        const nextTrackNumber = state.items.playlist.length + 1;
        state.items.playlist.push({
          track: nextTrackNumber,
          ...action.payload,
        });
      }
    },
  },
});

export const { addSong } = playlistSlice.actions;
export default playlistSlice.reducer;
