
import React from 'react';

import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';

import Login from './pages/Login';

import Register from './pages/Register';

import CustomerDashboard from './pages/Dashboard';

import AdminDashboard from './pages/AdminDashboard';

import PackageDetail from './pages/PackageDetail'; // Import baru



const ProtectedRoute = ({ children }) => {

  const user = JSON.parse(localStorage.getItem('rememberedUser'));

  if (!user || user.role !== 'admin') {

    return <Navigate to="/login" replace />;

  }

  return children;

};



function App() {

  return (

    <Routes>

      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<CustomerDashboard />} />

      <Route path="/package/:id" element={<PackageDetail />} /> 

      <Route path="/checkout/:id" element={<div style={{color:'white', padding: '50px'}}>Proses Pembayaran...</div>} />

      

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

  );

}



export default App;