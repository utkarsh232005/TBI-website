const workbook = XLSX.read(data, { type: 'array' });
console.log('File read as ArrayBuffer');
console.log('Workbook sheets:', workbook.SheetNames);

const { startupSheet, vcSheet } = findRelevantSheet(workbook);
console.log('Found sheets (names):', { startupSheet, vcSheet });

if (startupSheet) {
  const summarySheetName = findSummarySheetName(workbook);
  console.log('Found summary sheet name:', summarySheetName);

  if (vcSheet) {
    if (summarySheetName) {
      console.log('Attempting to parse summary blocks...');
      const sheet = workbook.Sheets[summarySheetName];
      const parsedSummaryBlocks = robustParseSummaryBlocks(workbook);
      setSummaryBlocks(parsedSummaryBlocks);
      console.log('Parsed summary blocks and set state:', parsedSummaryBlocks);
      setNoSummaryFound(false);
    } else {
      console.warn('Summary sheet not found. Displaying dummy summary data.');
      setSummaryBlocks(dummyData);
      setNoSummaryFound(true);
    }
  }
}

try {
  // ... existing code ...
} catch (error) {
  // ... existing code ...
} finally {
  setIsLoading(false);
  // Set default selected graph after file upload
  setSelectedSummaryGraph('Startups - Status');
  console.log('setSelectedSummaryGraph called with:', 'Startups - Status');
  console.log('Current summaryBlocks state after setting default graph:', summaryBlocks); // This might lag due to state update async
}

reader.readAsArrayBuffer(file);
}; 