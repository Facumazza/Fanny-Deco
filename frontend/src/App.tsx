import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderStatusPage from './pages/OrderStatusPage';
import BankTransferPage from './pages/BankTransferPage';
import NotFoundPage from './pages/NotFoundPage';
import PoliticaCambioPage from './pages/info/PoliticaCambioPage';
import OpcionesPagoPage from './pages/info/OpcionesPagoPage';
import MetodoEnvioPage from './pages/info/MetodoEnvioPage';
import ContactoPage from './pages/info/ContactoPage';
import NosotrosPage from './pages/info/NosotrosPage';
import ElProcesoPage from './pages/info/ElProcesoPage';
import SustentabilidadPage from './pages/info/SustentabilidadPage';
import PrensaPage from './pages/info/PrensaPage';
import PreguntasFrecuentesPage from './pages/info/PreguntasFrecuentesPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsListPage from './pages/admin/ProductsListPage';
import ProductNewPage from './pages/admin/ProductNewPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import CategoriesListPage from './pages/admin/CategoriesListPage';
import CategoryNewPage from './pages/admin/CategoryNewPage';
import CategoryEditPage from './pages/admin/CategoryEditPage';
import OrdersListPage from './pages/admin/OrdersListPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';
import ReviewsListPage from './pages/admin/ReviewsListPage';
import ReviewNewPage from './pages/admin/ReviewNewPage';
import ReviewEditPage from './pages/admin/ReviewEditPage';
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { WhatsAppButton } from './components/layout/WhatsAppButton';

// Reset scroll on every route change. Without this, react-router keeps the
// previous page's scroll position, so clicking a product card near the bottom
// of the home lands you at the bottom of the product page.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/producto/:slug" element={<ProductPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orden/:reference" element={<OrderConfirmationPage />} />
        <Route path="/orden/:reference/transferencia" element={<BankTransferPage />} />
        <Route path="/orden/:reference/success" element={<OrderStatusPage kind="success" />} />
        <Route path="/orden/:reference/fallo" element={<OrderStatusPage kind="failure" />} />
        <Route path="/orden/:reference/pendiente" element={<OrderStatusPage kind="pending" />} />
        {/* Content / info pages */}
        <Route path="/politica-de-cambio-y-devolucion" element={<PoliticaCambioPage />} />
        <Route path="/opciones-de-pago" element={<OpcionesPagoPage />} />
        <Route path="/metodo-de-envio" element={<MetodoEnvioPage />} />
        <Route path="/contacto" element={<ContactoPage />} />
        <Route path="/nosotros" element={<NosotrosPage />} />
        <Route path="/el-proceso" element={<ElProcesoPage />} />
        <Route path="/sustentabilidad" element={<SustentabilidadPage />} />
        <Route path="/prensa" element={<PrensaPage />} />
        <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentesPage />} />
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
        <Route
          path="/admin/orders"
          element={<ProtectedRoute><OrdersListPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/orders/:id"
          element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/reviews"
          element={<ProtectedRoute><ReviewsListPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/reviews/new"
          element={<ProtectedRoute><ReviewNewPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/reviews/:id/edit"
          element={<ProtectedRoute><ReviewEditPage /></ProtectedRoute>}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <WhatsAppButton />
      </CartProvider>
    </AuthProvider>
  );
}
