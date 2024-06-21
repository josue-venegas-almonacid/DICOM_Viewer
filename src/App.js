// src/App.js
import React from 'react';
import './App.css';
import RTDoseViewer from './components/RTDoseViewer';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>DICOM RT Dose File Reader</h1>
        <RTDoseViewer />
      </header>
    </div>
  );
}

export default App;
