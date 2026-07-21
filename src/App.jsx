import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './store/slices/authSlice';

import { ThemeProvider } from './app/ThemeContext';
import { AuraBackground } from './components/ui/AuraBackground';
import { IslandLayout } from './components/layout/IslandLayout';
import ProtectedRoute from './components/ProtectedRoute';

const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Storefront = React.lazy(() => import('./pages/Storefront'));
const Products = React.lazy(() => import('./pages/Products'));
const Categories = React.lazy(() => import('./pages/Categories'));
const Inventory = React.lazy(() => import('./pages/Inventory'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Users = React.lazy(() => import('./pages/Users'));
const Settings = React.lazy(() => import('./pages/Settings'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
);

import { Toaster } from 'sonner';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  return (
    <ThemeProvider>
      <Toaster richColors position="top-right" />
      <AuraBackground />
      <BrowserRouter>
        <React.Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/" element={<ProtectedRoute><IslandLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="storefront" element={<Storefront />} />
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
