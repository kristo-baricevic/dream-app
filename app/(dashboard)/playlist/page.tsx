'use client';

import { RootState } from '@/redux/rootReducer';
import { fetchEntries } from '@/redux/slices/journalSlice';
import { AppDispatch } from '@/redux/store';
import { collectSongs } from '@/utils/collectSongs';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function PlaylistPage() {
  const playlist = useSelector((state: RootState) => state.playlist.items);
  const entries = useSelector((state: RootState) => state.journal.entries);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (entries.length > 1) collectSongs(entries, dispatch);
  }, [entries]);

  const userId = 3333;

  useEffect(() => {
    if (userId) {
      dispatch(fetchEntries({}));
    }
  }, [userId, dispatch]);

  return (
    <div className="w-full h-full px-4 py-4">
      <div className="flex flex-col">
        <div className="w-full h-full bg-pink-200 px-4 py-4">PLAYLIST</div>
        <div className="mt-4 mb-4">
          Our Dream Doctor at times feels inclined to suggest some songs based off your dream
          analysis. This is a playlist made from the AI interpretations of your dreams!
        </div>
        <div className="w-full h-full bg-slate-50 rounded-xl border border-slate-400 px-4 py-4">
          {playlist && playlist.playlist.length > 0 ? (
            playlist.playlist.map((track) => (
              <div key={track.track} className="py-2">
                {track.artist} - "{track.title}"
              </div>
            ))
          ) : (
            <div>No Items</div>
          )}
        </div>
      </div>
    </div>
  );
}
