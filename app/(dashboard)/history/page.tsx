import HistoryChart from '@/components/HistoryChart';
import RadarChart from '@/components/RadarChart';
import PieChart from '@/components/PieChart';
import { getData } from '@/services/getData';
import HorizontalBarChart from '@/components/HorizontalBarChart';

export const dynamic = 'force-dynamic';

const History = async () => {
  const { analyses, avg } = await getData();

  return (
    <div className="w-full h-full bg-pink-100 px-4 py-4">
      <div className="flex flex-col">
        <div className="w-full h-full bg-pink-200 px-4 py-4 rounded-lg mt-2">
          <HistoryChart data={analyses} />
        </div>
        <div className="flex w-full py-5 px-2 lg:gap-24 gap-8 flex-wrap justify-center rounded-lg mt-2 bg-pink-300">
          <div className="flex w-full  max-w-[400px] py-10 px-2 bg-pink-100 rounded-lg shadow-md">
            <RadarChart data={analyses} />
          </div>
          <div className="flex w-full  max-w-[400px] py-10 px-2 bg-pink-400 rounded-lg shadow-md">
            <PieChart data={analyses} />
          </div>
        </div>
        <div className="flex py-4 px-2 mt-2 bg-pink-400 rounded-lg shadow-md">
          <HorizontalBarChart data={analyses} />
        </div>
      </div>
    </div>
  );
};

export default History;
