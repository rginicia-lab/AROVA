import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/checkout.css";

const Checkout = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  // =========================
  // FETCH CART
  // =========================

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/v1/cart");

      if (response.data.success) {
        const cartData = response.data.cart;

        if (!cartData?.items?.length) {
          navigate("/cart");
          return;
        }

        setCart(cartData);
      }
    } catch (err) {
      console.error("Checkout cart error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load checkout."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // COUPON
  // =========================

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code.");
      setCouponMessage("");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");
      setCouponMessage("");

      const response = await api.post(
        "/v1/coupons/validate",
        {
          code: couponCode.trim(),
          subtotal: Number(
            cart?.pricing?.subtotal || 0
          ),
        }
      );

      if (response.data.success) {
        setCoupon(response.data.coupon);
        setDiscount(
          Number(response.data.discount || 0)
        );

        setCouponMessage(
          "Coupon applied successfully!"
        );
      }
    } catch (err) {
      console.error("Coupon error:", err);

      setCoupon(null);
      setDiscount(0);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setCouponError(
        err.response?.data?.message ||
          "Invalid coupon."
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setDiscount(0);
    setCouponCode("");
    setCouponError("");
    setCouponMessage("");
  };

  // =========================
  // PLACE ORDER
  // =========================

  const placeOrder = async (event) => {
    event.preventDefault();

    try {
      setPlacingOrder(true);
      setError("");

      const response = await api.post(
        "/v1/orders/checkout",
        {
          shippingAddress: form,
          paymentMethod,
          couponCode: coupon?.code || null,
        }
      );

      if (response.data.success) {
        alert("Order placed successfully!");

        navigate(
          `/orders/${response.data.order._id}`
        );
      }
    } catch (err) {
      console.error("Place order error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to place order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="checkout-page">
        <h2>Loading checkout...</h2>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && !cart) {
    return (
      <main className="checkout-page">
        <h2>{error}</h2>

        <button
          type="button"
          onClick={() => navigate("/cart")}
        >
          Back to Cart
        </button>
      </main>
    );
  }

  // =========================
  // PRICING
  // =========================

  const subtotal = Number(
    cart?.pricing?.subtotal || 0
  );

  const shipping =
    subtotal >= 999 ? 0 : 99;

  const total = Math.max(
    0,
    subtotal + shipping - discount
  );

  // =========================
  // PAGE
  // =========================

  return (
    <main className="checkout-page">

      {/* BACK */}

      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/cart")}
      >
        ← Back to Cart
      </button>

      {/* HEADER */}

      <header className="checkout-header">
        <span>AROVA</span>

        <h1>Checkout</h1>

        <p>
          Complete your details to place your order.
        </p>
      </header>

      <section className="checkout-content">

        {/* =========================
            DELIVERY DETAILS
        ========================= */}

        <form
          className="checkout-form"
          onSubmit={placeOrder}
        >

          <h2>Delivery Details</h2>

          <div className="checkout-field">
            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />
          </div>

          <div className="checkout-field">
            <label htmlFor="phone">
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              autoComplete="tel"
              required
            />
          </div>

          <div className="checkout-field">
            <label htmlFor="line1">
              Address
            </label>

            <textarea
              id="line1"
              name="line1"
              value={form.line1}
              onChange={handleChange}
              placeholder="House / Street / Area"
              autoComplete="street-address"
              rows={4}
              required
            />
          </div>

          <div className="checkout-row">

            <div className="checkout-field">
              <label htmlFor="city">
                City
              </label>

              <input
                id="city"
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                autoComplete="address-level2"
                required
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="state">
                State
              </label>

              <input
                id="state"
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
                autoComplete="address-level1"
                required
              />
            </div>

          </div>

          <div className="checkout-field">
            <label htmlFor="postalCode">
              PIN Code
            </label>

            <input
              id="postalCode"
              type="text"
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              placeholder="6-digit PIN code"
              inputMode="numeric"
              maxLength={6}
              autoComplete="postal-code"
              required
            />
          </div>

          {/* =========================
              PAYMENT
          ========================= */}

          <div className="payment-section">

            <h2>Payment Method</h2>

            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={
                  paymentMethod === "cod"
                }
                onChange={() =>
                  setPaymentMethod("cod")
                }
              />

              <span>
                Cash on Delivery
              </span>
            </label>

            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="online"
                checked={
                  paymentMethod === "online"
                }
                onChange={() =>
                  setPaymentMethod("online")
                }
              />

              <span>
                Online Payment
              </span>
            </label>

          </div>

          {error && (
            <p className="checkout-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="place-order-button"
            disabled={placingOrder}
          >
            {placingOrder
              ? "Placing Order..."
              : "Place Order"}
          </button>

        </form>

        {/* =========================
            ORDER SUMMARY
        ========================= */}

        <aside className="checkout-summary">

          <h2>Order Summary</h2>

          {cart?.items?.map((item) => {

            const itemPrice =
              Number(item.product.price || 0);

            const itemTotal =
              itemPrice * item.quantity;

            return (
              <div
                className="checkout-item"
                key={item.product._id}
              >

                <span>
                  {item.product.name} ×{" "}
                  {item.quantity}
                </span>

                <strong>
                  ₹
                  {itemTotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>
            );
          })}

          <div className="summary-divider" />

          {/* =========================
              COUPON
          ========================= */}

          <div className="coupon-section">

            <h3>Have a coupon?</h3>

            {!coupon ? (
              <>
                <div className="coupon-input-row">

                  <input
                    type="text"
                    value={couponCode}
                    onChange={(event) =>
                      setCouponCode(
                        event.target.value.toUpperCase()
                      )
                    }
                    placeholder="Enter coupon code"
                  />

                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading}
                  >
                    {couponLoading
                      ? "Applying..."
                      : "Apply"}
                  </button>

                </div>

                {couponError && (
                  <p className="coupon-error">
                    {couponError}
                  </p>
                )}

                {couponMessage && (
                  <p className="coupon-success">
                    {couponMessage}
                  </p>
                )}
              </>
            ) : (
              <div className="applied-coupon">

                <div>
                  <strong>
                    {coupon.code}
                  </strong>

                  <span>
                    Coupon applied
                  </span>
                </div>

                <button
                  type="button"
                  onClick={removeCoupon}
                >
                  Remove
                </button>

              </div>
            )}

          </div>

          <div className="summary-divider" />

          {/* SUBTOTAL */}

          <div className="summary-row">

            <span>Subtotal</span>

            <strong>
              ₹
              {subtotal.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

          {/* SHIPPING */}

          <div className="summary-row">

            <span>Shipping</span>

            <strong>
              {shipping === 0
                ? "FREE"
                : `₹${shipping.toLocaleString(
                    "en-IN"
                  )}`}
            </strong>

          </div>

          {/* DISCOUNT */}

          {discount > 0 && (
            <div className="summary-row discount-row">

              <span>
                Coupon Discount
              </span>

              <strong>
                − ₹
                {discount.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>
          )}

          <div className="summary-divider" />

          {/* TOTAL */}

          <div className="summary-total">

            <span>Total</span>

            <strong>
              ₹
              {total.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

        </aside>

      </section>
    </main>
  );
};

export default Checkout;