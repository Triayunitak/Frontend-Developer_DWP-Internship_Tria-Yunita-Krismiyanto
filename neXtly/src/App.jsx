import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

// Buat komponen sementara agar tidak error saat import
const LoginPlaceholder = () => <div style={{ color: 'white' }}>Halaman Login (Sedang dibuat)</div>;
const DashboardPlaceholder = () => <div style={{ color: 'white' }}>Halaman Dashboard (Sedang dibuat)</div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPlaceholder />} />
      <Route path="/dashboard" element={<DashboardPlaceholder />} />
      {/* Jika user nyasar, arahkan ke landing page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;