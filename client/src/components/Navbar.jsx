import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, isAuthenticated } = useAuth();

  const closeMenu = () => setMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  const isAdmin = isAuthenticated && user?.role === "admin";

  return (
    <>
      <nav className="arova-navbar">

        {/* LOGO */}
        <Link
          to="/"
          className="arova-logo"
          onClick={closeMenu}
        >
          AROVA<span>.</span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="nav-links">

          <Link
            to="/"
            className={isActive("/") ? "active" : ""}
          >
            Home
          </Link>

          <Link
            to="/shop"
            className={isActive("/shop") ? "active" : ""}
          >
            Shop
          </Link>

          <Link
            to="/wishlist"
            className={isActive("/wishlist") ? "active" : ""}
          >
            Wishlist
          </Link>

          <Link
            to="/orders"
            className={isActive("/orders") ? "active" : ""}
          >
            Orders
          </Link>

          <Link
            to="/price-watches"
            className={
              isActive("/price-watches")
                ? "active"
                : ""
            }
          >
            Price Watch
          </Link>

          <Link
            to="/notifications"
            className={
              isActive("/notifications")
                ? "active"
                : ""
            }
          >
            Notifications
          </Link>

          {/* ADMIN NAVIGATION */}
          {isAdmin && (
            <>
              <Link
                to="/admin"
                className={
                  isActive("/admin")
                    ? "active"
                    : ""
                }
              >
                Dashboard
              </Link>

              <Link
                to="/admin/orders"
                className={
                  isActive("/admin/orders")
                    ? "active"
                    : ""
                }
              >
                Admin Orders
              </Link>

              <Link
                to="/admin/reviews"
                className={
                  isActive("/admin/reviews")
                    ? "active"
                    : ""
                }
              >
                Reviews
              </Link>

              <Link
                to="/admin/inventory"
                className={
                  isActive("/admin/inventory")
                    ? "active"
                    : ""
                }
              >
                Inventory
              </Link>

              <Link
                to="/admin/coupons"
                className={
                  isActive("/admin/coupons")
                    ? "active"
                    : ""
                }
              >
                Coupons
              </Link>
            </>
          )}
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="nav-actions">

          <Link
            to="/cart"
            className="nav-cart"
          >
            Cart
          </Link>

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="nav-login"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="nav-register"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              type="button"
              className="nav-login"
              onClick={() => {
                localStorage.removeItem("arova_token");
                localStorage.removeItem("arova_user");
                window.location.href = "/login";
              }}
            >
              Logout
            </button>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className={`nav-menu-button ${
            menuOpen ? "open" : ""
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* MOBILE SIDEBAR */}
      <aside
        className={`mobile-sidebar ${
          menuOpen ? "open" : ""
        }`}
      >

        <div className="mobile-sidebar-header">
          <span>MENU</span>

          <button onClick={closeMenu}>
            ×
          </button>
        </div>

        <div className="mobile-sidebar-links">

          <Link
            to="/"
            className={
              isActive("/")
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            to="/shop"
            className={
              isActive("/shop")
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Shop
          </Link>

          <Link
            to="/wishlist"
            className={
              isActive("/wishlist")
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Wishlist
          </Link>

          <Link
            to="/orders"
            className={
              isActive("/orders")
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Orders
          </Link>

          <Link
            to="/price-watches"
            className={
              isActive("/price-watches")
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Price Watch
          </Link>

          <Link
            to="/notifications"
            className={
              isActive("/notifications")
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Notifications
          </Link>

          {/* MOBILE ADMIN NAVIGATION */}
          {isAdmin && (
            <>
              <div className="mobile-sidebar-divider"></div>

              <Link
                to="/admin"
                className={
                  isActive("/admin")
                    ? "active"
                    : ""
                }
                onClick={closeMenu}
              >
                Admin Dashboard
              </Link>

              <Link
                to="/admin/orders"
                className={
                  isActive("/admin/orders")
                    ? "active"
                    : ""
                }
                onClick={closeMenu}
              >
                Admin Orders
              </Link>

              <Link
                to="/admin/reviews"
                className={
                  isActive("/admin/reviews")
                    ? "active"
                    : ""
                }
                onClick={closeMenu}
              >
                Admin Reviews
              </Link>

              <Link
                to="/admin/inventory"
                className={
                  isActive("/admin/inventory")
                    ? "active"
                    : ""
                }
                onClick={closeMenu}
              >
                Admin Inventory
              </Link>

              <Link
                to="/admin/coupons"
                className={
                  isActive("/admin/coupons")
                    ? "active"
                    : ""
                }
                onClick={closeMenu}
              >
                Admin Coupons
              </Link>
            </>
          )}

          <div className="mobile-sidebar-divider"></div>

          <Link
            to="/cart"
            onClick={closeMenu}
          >
            Cart
          </Link>

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                onClick={closeMenu}
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={closeMenu}
              >
                Register
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("arova_token");
                localStorage.removeItem("arova_user");
                closeMenu();
                window.location.href = "/login";
              }}
            >
              Logout
            </button>
          )}

        </div>
      </aside>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={closeMenu}
        ></div>
      )}
    </>
  );
};

export default Navbar;