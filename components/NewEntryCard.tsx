import useIsMobile from '@/utils/useIsMobile';
import { IconCloudFilled } from '@tabler/icons-react';

const NewEntryCard = () => {
  const isMobile = useIsMobile();
  if (isMobile)
    return (
      <div className="flex justify-center">
        <button className="flex items-center gap-2 cursor-pointer bg-white shadow-md border border-gray-200 rounded-xl px-6 py-2 hover:bg-slate-100 transition">
          <IconCloudFilled className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Add</span>
        </button>
      </div>
    );

  return (
    <div className="flex justify-center">
      <button className="flex items-center gap-2 cursor-pointer bg-white shadow-md border border-gray-200 rounded-xl px-6 py-4 hover:bg-slate-100 transition">
        <IconCloudFilled className="w-6 h-6 text-slate-600" />
        <span className="text-xl font-medium text-slate-700">Add a New Dream</span>
      </button>
    </div>
  );
};

export default NewEntryCard;
