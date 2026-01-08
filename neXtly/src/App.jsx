import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import PackageDetail from './pages/PackageDetail';
import Discount from './pages/Discount';
import History from './pages/History';
import Checkout from './pages/Checkout';

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('rememberedUser'));
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/discount" element={<Discount />} />
        <Route path="/history" element={<History />} />
        
        {/* Route Detail & Checkout */}
        <Route path="/package/:id" element={<PackageDetail />} /> 
        <Route path="/checkout/:id" element={<Checkout />} />
        
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;