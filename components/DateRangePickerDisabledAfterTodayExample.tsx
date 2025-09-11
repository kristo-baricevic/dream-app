'use client';

import React from 'react';
import { DateRange, DateRangePicker } from '@/components/DatePicker';
import useIsMobile from '@/utils/useIsMobile';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { fetchEntries, setSearchParams } from '@/redux/slices/journalSlice';
import { RootState } from '@/redux/rootReducer';

export const DateRangePickerDisabledAfterTodayExample = () => {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const isMobile = useIsMobile();
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSelector((state: RootState) => state.journal.searchParams);

  const handleChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      const start = range.from.toISOString().split('T')[0];
      const end = range.to.toISOString().split('T')[0];
      dispatch(setSearchParams({ start_date: start, end_date: end }));
      dispatch(fetchEntries({ ...searchParams, start_date: start, end_date: end }));
    }
  };

  if (isMobile)
    return (
      <div className="flex flex-col items-center gap-y-4 shadow-md">
        <DateRangePicker
          toDate={new Date()}
          value={dateRange}
          onChange={handleChange}
          className="w-20"
        />
      </div>
    );

  return (
    <div className="flex flex-col items-center gap-y-4 shadow-md">
      <DateRangePicker
        toDate={new Date()}
        value={dateRange}
        onChange={handleChange}
        className="w-60 h-14"
      />
    </div>
  );
};
