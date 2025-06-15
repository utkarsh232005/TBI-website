import React from 'react';
import { useSearchFilter } from '@/hooks/useSearchFilter';
import { useYearFilter } from '@/hooks/useYearFilter';

// Example data type
interface ExampleData {
  id: number;
  name: string;
  year: number;
  category: string;
}

// Example data
const exampleData: ExampleData[] = [
  { id: 1, name: "Project A", year: 2023, category: "Tech" },
  { id: 2, name: "Project B", year: 2022, category: "Health" },
  { id: 3, name: "Project C", year: 2023, category: "Education" },
];

export function ExampleComponent() {
  // Using the search filter hook
  const { 
    searchTerm, 
    setSearchTerm, 
    filteredData: searchedData 
  } = useSearchFilter<ExampleData>(
    exampleData,
    ['name', 'category'] // Search in these fields
  );

  // Using the year filter hook
  const { 
    filterYear, 
    setFilterYear, 
    filteredData: finalData,
    years 
  } = useYearFilter<ExampleData>(searchedData);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Example Component</h2>
      
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded"
        />
      </div>

      {/* Year Filter */}
      <div className="mb-4">
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="p-2 border rounded"
        >
          <option value="all">All Years</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Display Filtered Data */}
      <div>
        {finalData.map(item => (
          <div key={item.id} className="p-2 border-b">
            <h3>{item.name}</h3>
            <p>Year: {item.year}</p>
            <p>Category: {item.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 