import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './App.css';

function App() {
  const [excelData, setExcelData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExcelFile(); // Load the Excel file when the component mounts
  }, []);

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

  // Filter data based on search term, excluding the header row
  const filteredData = excelData.filter((row, index) => {
    if (index === 0) {
      return true; // include header row
    }
    return row[0].toLowerCase().includes(searchTerm.toLowerCase()); // assuming Name is in the first column
  });

  return (
    <div className="App">
      <h1>Currency Tracker</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Country Name..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div className="excel-data">
        <h2>Excel Data:</h2>
        <table>
          <thead>
            <tr>
              {excelData.length > 0 &&
                excelData[0].map((cell, index) => (
                  <th key={index}>{cell}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => {
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
