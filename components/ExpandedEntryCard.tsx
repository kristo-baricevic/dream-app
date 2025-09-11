'use client';

import { AnalysisData, JournalEntry } from '@/types';
import { lightenColor } from '@/utils/colorUtilities';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconEdit } from '@tabler/icons-react';
import { useEffect } from 'react';

type ExpandedEntryCardProps = {
  entry: JournalEntry;
  href: string;
  onDelete: (id: string) => void;
  analysis: AnalysisData;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
};

const ExpandedEntryCard = ({
  entry,
  href,
  onDelete,
  isExpanded = false,
  onToggleExpand,
}: ExpandedEntryCardProps) => {
  const router = useRouter();

  const handleDelete = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    onDelete(entry.id);
  };

  const handleClick = () => {
    if (onToggleExpand) {
      onToggleExpand();
    }
  };

  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isExpanded) {
      timeout = setTimeout(() => setShowContent(true), 300);
    } else {
      setShowContent(false);
    }
    return () => clearTimeout(timeout);
  }, [isExpanded]);

  const date = new Date(entry.created_at).toDateString();
  const [dreamAnalysis, setAnalysis] = useState<Partial<AnalysisData> | undefined>(entry.analysis);

  console.log('dream analysis ', dreamAnalysis);

  const cloudStyle = { background: lightenColor(dreamAnalysis?.color, 13) };

  return (
    <div
      className={`${isExpanded ? 'cloud-tall' : 'cloud'} border border-style border-black transition-all duration-500 ease-in-out cursor-pointer`}
      style={cloudStyle}
      onClick={handleClick}
    >
      <div className={`${isExpanded ? 'mt-4' : ''} ml-10 flex flex-col`}>
        <div className="px-4 font-serif">{date}</div>
        <div className="px-4 content-truncate font-bold">{dreamAnalysis?.subject}</div>
        {isExpanded && showContent ? (
          <div className="mt-4 mr-4 px-4 max-h-[270px] overflow-y-auto space-y-2">
            <div className="font-serif transition-opacity duration-300">
              <span className="font-bold">Summary:</span> {dreamAnalysis?.summary}
            </div>
            <div className="font-serif transition-opacity duration-300">
              <span className="font-bold">Mood: </span>
              {dreamAnalysis?.mood}
            </div>
            <div className="font-serif transition-opacity duration-300">
              <span className="font-bold">Analysis: </span>
              {dreamAnalysis?.interpretation}
            </div>
          </div>
        ) : (
          <div className="px-4 content-truncate font-serif">{dreamAnalysis?.summary}</div>
        )}

        <div
          onClick={(e) => {
            e.stopPropagation();
            router.push(href);
          }}
          className={`absolute ${isExpanded ? 'bottom-12' : 'bottom-4'} right-20 hover:opacity-50 cursor-pointer w-6 h-6 group`}
        >
          <IconEdit />
          <span className="absolute bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1">
            Edit
          </span>
        </div>

        <div
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(e);
          }}
          className={`absolute ${isExpanded ? 'bottom-12' : 'bottom-4'} right-12 hover:opacity-50 cursor-pointer w-6 h-6 group`}
        >
          <Image src="/trash.svg" width="24" height="24" alt="Delete Icon" />
          <span className="absolute bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1">
            Delete
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExpandedEntryCard;
