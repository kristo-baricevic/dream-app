import { JournalEntry } from '@/types';
import { extractSong } from './extractSong';
import { addSong } from '@/redux/slices/playlistSlice';
import { AppDispatch } from '@/redux/store';

export function collectSongs(entries: JournalEntry[], dispatch: AppDispatch) {
  entries.forEach((entry) => {
    const text = String(entry.analysis?.interpretation ?? '');

    const song = extractSong(text);
    if (song) {
      dispatch(addSong(song));
    }
  });
}
