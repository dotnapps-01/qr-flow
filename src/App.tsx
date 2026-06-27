import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Builder } from './pages/Builder';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { RedirectHandler } from './pages/RedirectHandler';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone Route for handling QR scans */}
          <Route path="/q/:id" element={<RedirectHandler />} />
          
          {/* Main App Routes with Layout */}
          <Route path="*" element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/builder" element={<Builder />} />
                <Route path="/projects" element={<div className="text-display">Projects Component</div>} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Routes>
            </AppLayout>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
