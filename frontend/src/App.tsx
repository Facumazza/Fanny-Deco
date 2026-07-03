import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsListPage from './pages/admin/ProductsListPage';
import ProductNewPage from './pages/admin/ProductNewPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/producto/:slug" element={<ProductPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/products"
          element={<ProtectedRoute><ProductsListPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/products/new"
          element={<ProtectedRoute><ProductNewPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/products/:id/edit"
          element={<ProtectedRoute><ProductEditPage /></ProtectedRoute>}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
