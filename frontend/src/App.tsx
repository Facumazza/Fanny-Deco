import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsListPage from './pages/admin/ProductsListPage';
import ProductNewPage from './pages/admin/ProductNewPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import CategoriesListPage from './pages/admin/CategoriesListPage';
import CategoryNewPage from './pages/admin/CategoryNewPage';
import CategoryEditPage from './pages/admin/CategoryEditPage';
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/producto/:slug" element={<ProductPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orden/:reference" element={<OrderConfirmationPage />} />
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
        <Route
          path="/admin/categories"
          element={<ProtectedRoute><CategoriesListPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/categories/new"
          element={<ProtectedRoute><CategoryNewPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/categories/:id/edit"
          element={<ProtectedRoute><CategoryEditPage /></ProtectedRoute>}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
