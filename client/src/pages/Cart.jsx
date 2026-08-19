import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/cart.css";

const Cart = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/v1/cart");

      if (response.data.success) {
        setCart(response.data.cart);
      } else {
        setError(
          response.data.message ||
            "Unable to load cart."
        );
      }
    } catch (err) {
      console.error("Cart fetch error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load your cart."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (
    productId,
    quantity
  ) => {
    if (quantity < 1) return;

    try {
      const response = await api.patch(
        `/v1/cart/items/${productId}`,
        {
          quantity,
        }
      );

      if (response.data.success) {
        await fetchCart();
      }
    } catch (err) {
      console.error(
        "Update cart error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to update quantity."
      );
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await api.delete(
        `/v1/cart/items/${productId}`
      );

      if (response.data.success) {
        await fetchCart();
      }
    } catch (err) {
      console.error(
        "Remove cart error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to remove item."
      );
    }
  };

  if (loading) {
    return (
      <main className="cart-page">
        <div className="cart-loading">
          <h2>Loading your cart...</h2>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="cart-page">
        <div className="cart-error">
          <h2>{error}</h2>

          <button
            onClick={fetchCart}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const items = cart?.items || [];

  const pricing = cart?.pricing || {
    subtotal: 0,
    shipping: 0,
    total: 0,
  };

  /* ================= EMPTY CART ================= */

  if (items.length === 0) {
    return (
      <main className="cart-page">

        <section className="cart-header">
          <span>AROVA</span>
          <h1>Your Cart</h1>
          <p>
            Your carefully chosen products
            will appear here.
          </p>
        </section>

        <section className="empty-cart">

          <div className="empty-cart-icon">
            🛒
          </div>

          <h2>
            Your cart is empty
          </h2>

          <p>
            Looks like you haven't
            added anything yet.
          </p>

          <Link
            to="/shop"
            className="continue-shopping-button"
          >
            Discover Products
          </Link>

        </section>

      </main>
    );
  }

  return (
    <main className="cart-page">

      {/* ================= HEADER ================= */}

      <section className="cart-header">

        <span>AROVA</span>

        <h1>
          Your Cart
        </h1>

        <p>
          Review your selections
          before checkout.
        </p>

      </section>

      {/* ================= CART CONTENT ================= */}

      <section className="cart-content">

        {/* ================= ITEMS ================= */}

        <div className="cart-items">

          {items.map((item) => {

            const product = item.product;

            if (!product) {
              return null;
            }

            return (
              <article
                className="cart-item"
                key={product._id}
              >

                {/* IMAGE */}

                <div className="cart-item-image">

                  {product.images?.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                    />
                  ) : (
                    <div>
                      No Image
                    </div>
                  )}

                </div>

                {/* PRODUCT INFO */}

                <div className="cart-item-info">

                  <span>
                    AROVA
                  </span>

                  <h2>
                    {product.name}
                  </h2>

                  <p>
                    ₹
                    {Number(
                      product.price
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <small>
                    {product.stock > 0
                      ? `${product.stock} available`
                      : "Out of stock"}
                  </small>

                </div>

                {/* QUANTITY */}

                <div className="cart-quantity">

                  <button
                    type="button"
                    disabled={
                      item.quantity <= 1
                    }
                    onClick={() =>
                      updateQuantity(
                        product._id,
                        item.quantity - 1
                      )
                    }
                  >
                    −
                  </button>

                  <span>
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    disabled={
                      item.quantity >=
                      product.stock
                    }
                    onClick={() =>
                      updateQuantity(
                        product._id,
                        item.quantity + 1
                      )
                    }
                  >
                    +
                  </button>

                </div>

                {/* ITEM TOTAL */}

                <div className="cart-item-total">

                  <strong>
                    ₹
                    {(
                      Number(
                        product.price
                      ) *
                      Number(
                        item.quantity
                      )
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <button
                    type="button"
                    className="remove-item-button"
                    onClick={() =>
                      removeItem(
                        product._id
                      )
                    }
                  >
                    Remove
                  </button>

                </div>

              </article>
            );
          })}

        </div>

        {/* ================= SUMMARY ================= */}

        <aside className="cart-summary">

          <h2>
            Order Summary
          </h2>

          <div className="summary-row">

            <span>
              Subtotal
            </span>

            <strong>
              ₹
              {Number(
                pricing.subtotal
              ).toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

          <div className="summary-row">

            <span>
              Shipping
            </span>

            <strong>
              {pricing.shipping === 0
                ? "FREE"
                : `₹${Number(
                    pricing.shipping
                  ).toLocaleString(
                    "en-IN"
                  )}`}
            </strong>

          </div>

          <div className="summary-divider" />

          <div className="summary-total">

            <span>
              Total
            </span>

            <strong>
              ₹
              {Number(
                pricing.total
              ).toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

          <button
            className="checkout-button"
            onClick={() =>
              navigate("/checkout")
            }
          >
            Proceed to Checkout
          </button>

          <Link
            to="/shop"
            className="continue-shopping"
          >
            ← Continue Shopping
          </Link>

        </aside>

      </section>

    </main>
  );
};

export default Cart;