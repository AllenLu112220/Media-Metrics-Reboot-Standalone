// Upload.js
import React, { useState } from 'react';
import Papa from 'papaparse'; 
import '../styles/Upload.css';

const CsvDisplay = ({ data }) => {
  if (!data || data.length === 0) return <p>No data to display.</p>;

  const headers = Object.keys(data[0]);

  return (
    <table>
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {headers.map((header) => (
              <td key={header}>{row[header]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const FileUploadComponent = () => {
  const [csvData, setCsvData] = useState([]);
  const [file, setFile] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert('No file selected.');
      return;
    }

    // Check file format (assuming CSV is required)
    if (!file.name.endsWith('.csv')) {
      alert('Invalid file format. Please upload a CSV file.');
      return;
    }

    setFile(file);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://52.6.97.91:8000/api/upload-csv/', {
      //const response = await fetch('http://localhost:8000/api/upload-csv/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('File uploaded successfully.');

        // Read and parse the CSV file
        const reader = new FileReader();
        reader.onload = () => {
          const csvContent = reader.result;
          Papa.parse(csvContent, {
            complete: (result) => {
              setCsvData(result.data); // Store the parsed data
            },
            header: true, // Use this option if the CSV has a header row
          });
        };
        reader.readAsText(file);
      } else {
        const result = await response.json();
        alert(`Error uploading file: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error connecting to the server.');
    }
    event.target.value = null;

  };

  const handleUploadButtonClick = () => {
    const userConfirmed = window.confirm(
      'Please upload a Formatted CSV file.\n\n' +
      'Check the Guide to see what a correctly formatted file looks like.\n\n' +
      'Click OK to continue uploading file.'
    );
    if (userConfirmed) {
      document.getElementById('fileInput').click();
    }
  };

  return (
    <div className="upload-container">
      <button onClick={handleUploadButtonClick} className="upload-button-2">Select File</button>
      <input
        type="file"
        id="fileInput"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      
      {/* Display the CSV data */}
      <CsvDisplay data={csvData} />
    </div>
  );
  
};

export default FileUploadComponent;  // Default export of the component
