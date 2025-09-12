'use client';

import { AnalysisData, JournalEntry } from '@/types';
import { lightenColor } from '@/utils/colorUtilities';
import { IconEdit } from '@tabler/icons-react';
// import Link from "next/link";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import BasicModal from './BasicModal';

type EntryCardProps = {
  entry: JournalEntry;
  href: string;
  onDelete: (id: string) => void;
  analysis: AnalysisData;
};

const EntryCard = ({ entry, href, onDelete }: EntryCardProps) => {
  const router = useRouter();
  const handleDelete = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    onDelete(entry.id);
  };
  const [deleteModal, setDeleteModal] = useState<boolean>(false);

  const date = new Date(entry.created_at).toDateString();
  const [dreamAnalysis, setDreamAnalysis] = useState<Partial<AnalysisData> | undefined>(
    entry.analysis
  );

  const cloudStyle = { background: lightenColor(dreamAnalysis?.color, 13) };

  return (
    <div className="cloud border border-style border-black" style={cloudStyle}>
      <div className="ml-10 flex flex-col">
        <div className="px-4 font-serif">{date}</div>
        <div className="px-4 content-truncate font-bold">{dreamAnalysis?.subject}</div>
        <div className="px-4 content-truncate font-serif">{dreamAnalysis?.summary}</div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            router.push(href);
          }}
          className="absolute bottom-4 right-20 hover:opacity-50 cursor-pointer w-6 h-6 group"
        >
          <IconEdit />
          {/* <span className="absolute bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1">
            Edit
          </span> */}
        </div>

        <div
          onClick={(e) => {
            e.stopPropagation();
            setDeleteModal(true);
          }}
          className="absolute bottom-4 right-12 hover:opacity-50 cursor-pointer w-6 h-6 group"
        >
          <Image src="/trash.svg" width="24" height="24" alt="Delete Icon" />
          {/* <span className="absolute bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1">
            Delete
          </span> */}
        </div>
      </div>
      {deleteModal &&
        ReactDOM.createPortal(
          <BasicModal handleConfirm={handleDelete} setDeleteModal={setDeleteModal} />,
          document.body
        )}
    </div>
  );
};

export default EntryCard;
