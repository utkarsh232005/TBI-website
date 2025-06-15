import { useState, useMemo } from 'react';

interface YearFilterableItem {
  year: number;
}

interface UseYearFilterResult<T extends YearFilterableItem> {
  filterYear: number | "all";
  setFilterYear: (year: number | "all") => void;
  filteredData: T[];
  years: number[];
}

export function useYearFilter<T extends YearFilterableItem>(
  data: T[]
): UseYearFilterResult<T> {
  const [filterYear, setFilterYear] = useState<number | "all">("all");

  const filteredData = useMemo(() => {
    if (filterYear === "all") {
      return data;
    }
    return data.filter(item => item.year === filterYear);
  }, [data, filterYear]);

  const years = useMemo(() => {
    return Array.from(new Set(data.map(item => item.year))).sort((a, b) => b - a);
  }, [data]);

  return {
    filterYear,
    setFilterYear,
    filteredData,
    years,
  };
} 