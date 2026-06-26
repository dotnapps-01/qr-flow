import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Builder } from './pages/Builder';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/projects" element={<div className="text-display">Projects Component</div>} />
          <Route path="/settings" element={<Settings />} />
          {/* Add more routes here */}
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
