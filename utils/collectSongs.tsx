import { JournalEntry } from '@/types';
import { extractSong } from './extractSong';
import { addSong } from '@/redux/slices/playlistSlice';
import { AppDispatch } from '@/redux/store'; // adjust path to your store

type Track = {
  track: number;
  title: string;
  artist: string;
};

export function collectSongs(entries: JournalEntry[], dispatch: AppDispatch) {
  entries.forEach((entry) => {
    const text = String(entry.analysis?.interpretation ?? '');
    console.log('collect text ', text);

    const song = extractSong(text);
    console.log('collect song ', song);
    if (song) {
      dispatch(addSong(song));
    }
  });
}
