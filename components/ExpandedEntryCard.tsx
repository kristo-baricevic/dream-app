'use client';

import { AnalysisData, JournalEntry } from '@/types';
import { lightenColor } from '@/utils/colorUtilities';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconEdit } from '@tabler/icons-react';
import { useEffect } from 'react';
import useIsSmallScreen from '@/utils/isSmallScreen';
import useIsMobile from '@/utils/isMobile';
import { formatAnalysis } from '@/utils/formatAnalysis';
import BasicModal from './BasicModal';
import ReactDOM from 'react-dom';

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

  const handleDelete = () => {
    onDelete(entry.id);
    setDeleteModal(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.toolbar')) {
      return;
    }
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
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [viewType, setViewType] = useState<string>('entry');

  const [dreamAnalysis, setAnalysis] = useState<Partial<AnalysisData> | undefined>(entry.analysis);
  const isMobile = useIsMobile();
  const isSmallScreen = useIsSmallScreen();
  const cloudStyle = { background: lightenColor(dreamAnalysis?.color, 13) };

  return (
    <div
      className={`${isExpanded ? 'cloud-tall' : 'cloud'} border border-style border-black transition-all duration-500 ease-in-out cursor-pointer`}
      style={cloudStyle}
      onClick={(e) => {
        if (deleteModal) {
          e.stopPropagation();
          return;
        }
        handleClick(e);
      }}
    >
      <div className={`${isExpanded ? 'mt-4' : ''} ml-10 flex flex-col`}>
        <div className="flex flex-col">
          <div className="px-4 font-serif">{date}</div>
          <div className="px-4 content-truncate font-bold">{dreamAnalysis?.subject}</div>
          {isExpanded && showContent ? (
            <div className="mt-4 mr-4 px-4 max-h-[270px] overflow-y-auto space-y-2">
              {viewType === 'analysis' ? (
                <>
                  <div className="font-serif transition-opacity duration-300">
                    <span className="font-bold">Summary:</span> {dreamAnalysis?.summary}
                  </div>
                  <div className="font-serif transition-opacity duration-300">
                    <span className="font-bold">Mood: </span>
                    {dreamAnalysis?.mood}
                  </div>
                  <div className="font-serif transition-opacity duration-300">
                    <span className="font-bold">Analysis: </span>
                    {formatAnalysis(dreamAnalysis?.interpretation as string)}
                  </div>
                </>
              ) : (
                <div className="font-serif transition-opacity duration-300">{entry?.content}</div>
              )}
            </div>
          ) : viewType === 'analysis' ? (
            <div className="px-4 content-truncate font-serif">{dreamAnalysis?.summary}</div>
          ) : (
            <div className="px-4 content-truncate font-serif">{entry?.content}</div>
          )}
        </div>

        <div className={`flex justify-end mr-12 ${isExpanded ? 'mt-6' : ''} gap-2 toolbar`}>
          <div
            className="cursor-pointer mr-2"
            onClick={(e) => {
              e.stopPropagation();

              setViewType('entry');
            }}
          >
            <span className={`${viewType === 'entry' ? 'underline' : ''} text-sm`}>Entry</span>
          </div>
          <div
            className="cursor-pointer mr-2"
            onClick={(e) => {
              e.stopPropagation();

              setViewType('analysis');
            }}
          >
            <span className={`${viewType === 'analysis' ? 'underline' : ''} text-sm`}>
              Analysis
            </span>
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              router.push(href);
            }}
            className={`flex hover:opacity-50 cursor-pointer ${isMobile ? 'w-4 h-4 mt-[5px]' : 'w-6 h-6'} group`}
          >
            <IconEdit width="24" height="24" />
            {/* <span className="absolute bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1">
              Edit
            </span> */}
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModal(true);
            }}
            className={`flex hover:opacity-50 cursor-pointer  ${isMobile ? 'w-4 h-4 mt-2' : 'w-6 h-6'} group`}
          >
            <Image src="/trash.svg" width="24" height="24" alt="Delete Icon" />
          </div>
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

export default ExpandedEntryCard;
