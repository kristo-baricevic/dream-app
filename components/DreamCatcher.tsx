'use client';

import Link from 'next/link';
import EntryCard from './EntryCard';
import { JournalEntry } from '@/types';
// import { JournalEntry } from '@prisma/client';



type DreamCatcherProps = {
  entries: JournalEntry[];
  onDeleteEntry: (id: string) => void;
};

const DreamCatcher: React.FC<DreamCatcherProps> = ({ entries, onDeleteEntry }) => {
  return (
    <div className="flex flex-wrap justify-center p-2 gap-2">
      {entries.map((entry) => (
        <Link href={`/journal/${entry.id}`} key={entry.id}>
          <div>
            <EntryCard entry={entry} onDelete={onDeleteEntry} href={`/journal/${entry.id}`} analysis={{
              id: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              entryId: '',
              userId: '',
              mood: '',
              summary: '',
              color: '',
              interpretation: '',
              negative: false,
              subject: '',
              sentimentScore: 0
            }} />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default DreamCatcher;
