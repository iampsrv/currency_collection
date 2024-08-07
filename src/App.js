import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './App.css';

function App() {
  const [excelData, setExcelData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [uniqueNamesCount, setUniqueNamesCount] = useState(0);

  useEffect(() => {
    fetchExcelFile(); // Load the Excel file when the component mounts
  }, []);

  useEffect(() => {
    if (excelData.length > 0) {
      // Calculate unique names count from the first column (excluding header)
      const names = excelData.slice(1).map(row => row[0]);
      const uniqueNames = [...new Set(names)];
      setUniqueNamesCount(uniqueNames.length);
    }
  }, [excelData]);

  const fetchExcelFile = () => {
    const fileUrl = process.env.PUBLIC_URL + '/example.xlsx'; // Adjusted file path
    fetch(fileUrl)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        setExcelData(parsedData);
      })
      .catch((error) => {
        console.error('Error fetching Excel file:', error);
      });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Function to dynamically sort data based on sortConfig
  const sortedData = () => {
    const sortableData = [...excelData];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        let comparison = 0;
        if (typeof a[sortConfig.key] === 'string') {
          comparison = a[sortConfig.key].localeCompare(b[sortConfig.key]);
        } else {
          comparison = a[sortConfig.key] - b[sortConfig.key];
        }
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableData;
  };

  // Filter and sort data based on search term and sortConfig
  const filteredAndSortedData = sortedData().filter((row, rowIndex) => {
    if (rowIndex === 0) {
      return true; // include header row
    }
    // Filter by any column
    return row.some((cell, cellIndex) => {
      if (typeof cell === 'string' && cellIndex !== 0) {
        return cell.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  });

  return (
    <div className="App">
      <h1>Currency Tracker</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by any field..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div className="excel-data">
        <h2>Excel Data:</h2>
        <p>Total Unique Names: {uniqueNamesCount}</p>
        <table>
          <thead>
            <tr>
              {excelData.length > 0 &&
                excelData[0].map((cell, index) => (
                  <th key={index} onClick={() => requestSort(index)}>
                    {cell}
                    {sortConfig.key === index && (
                      <span>{sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽'}</span>
                    )}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.map((row, rowIndex) => {
              if (rowIndex === 0) return null; // skip rendering of header row
              return (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
