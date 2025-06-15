import { useState, useMemo } from 'react';

interface SearchableItem {
  [key: string]: any;
}

interface UseSearchFilterResult<T extends SearchableItem> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredData: T[];
}

export function useSearchFilter<T extends SearchableItem>(
  data: T[],
  searchKeys: (keyof T)[]
): UseSearchFilterResult<T> {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return data;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return data.filter(item =>
      searchKeys.some(key =>
        String(item[key]).toLowerCase().includes(lowerCaseSearchTerm)
      )
    );
  }, [data, searchTerm, searchKeys]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
  };
} 