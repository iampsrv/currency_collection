import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './App.css';

function App() {
  const [excelData, setExcelData] = useState([]);

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

  return (
    <div className="App">
      <h1>Excel Data Viewer</h1>
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
            {excelData.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
