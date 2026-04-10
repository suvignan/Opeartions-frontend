import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/context/AuthContext';
import { Layout } from './shared/layout/Layout';
import { Dashboard } from './features/dashboard/pages/Dashboard';
import { ContractsList } from './features/contracts/pages/ContractsList';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="contracts" element={<ContractsList />} />
            <Route path="*" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">404 - Page Not Found</h2></div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
