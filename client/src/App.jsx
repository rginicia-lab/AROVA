import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Checkout from "./pages/Checkout";

import AdminDashboard from "./pages/AdminDashboard";
import Orders from "./pages/Orders";
import AdminOrders from "./pages/AdminOrders";
import OrderTracking from "./pages/OrderTracking";

import Wishlist from "./pages/Wishlist";
import AdminReviews from "./pages/AdminReviews";
import AdminInventory from "./pages/AdminInventory";
import AdminCoupons from "./pages/AdminCoupons";
import Notifications from "./pages/Notifications";
import MyPriceWatches from "./pages/MyPriceWatches";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>

          {/* =========================
              PUBLIC ROUTES
          ========================= */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/product/:id"
            element={<ProductDetails />}
          />

          {/* =========================
              PROTECTED ROUTES
          ========================= */}

          <Route element={<ProtectedRoute />}>

            <Route
              path="/shop"
              element={<Shop />}
            />

            <Route
              path="/cart"
              element={<Cart />}
            />

            <Route
              path="/wishlist"
              element={<Wishlist />}
            />

            <Route
              path="/checkout"
              element={<Checkout />}
            />

            {/* MY ORDERS */}

            <Route
              path="/orders"
              element={<Orders />}
            />

            {/* ORDER TRACKING */}

            <Route
              path="/orders/:id"
              element={<OrderTracking />}
            />

            {/* PRICE WATCH */}

            <Route
              path="/price-watches"
              element={<MyPriceWatches />}
            />

            {/* NOTIFICATIONS */}

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            {/* =========================
                ADMIN
            ========================= */}

            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/orders"
              element={<AdminOrders />}
            />

            <Route
              path="/admin/reviews"
              element={<AdminReviews />}
            />

            <Route
              path="/admin/inventory"
              element={<AdminInventory />}
            />

            <Route
              path="/admin/coupons"
              element={<AdminCoupons />}
            />

          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;