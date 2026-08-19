import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/v1/orders/${id}`
      );

      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (err) {
      console.error("Order error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load order."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="order-details-page">
        <h2>Loading order...</h2>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-details-page">
        <h2>{error || "Order not found"}</h2>

        <button onClick={() => navigate("/orders")}>
          View Orders
        </button>
      </main>
    );
  }

  const statuses = [
    "placed",
    "confirmed",
    "shipped",
    "delivered",
  ];

  const currentStatus = order.status;

  const currentIndex =
    statuses.indexOf(currentStatus);

  return (
    <main className="order-details-page">

      <button
        className="back-button"
        onClick={() => navigate("/orders")}
      >
        ← My Orders
      </button>

      <header className="order-details-header">
        <p>AROVA</p>

        <h1>Order Details</h1>

        <span>
          Order #{order._id}
        </span>
      </header>

      {/* TRACKING */}

      <section className="order-tracking">

        <h2>Order Tracking</h2>

        <div className="tracking-steps">

          {statuses.map((status, index) => {

            const completed =
              index <= currentIndex;

            return (
              <div
                className={
                  completed
                    ? "tracking-step completed"
                    : "tracking-step"
                }
                key={status}
              >
                <div className="tracking-circle">
                  {completed ? "✓" : index + 1}
                </div>

                <span>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1)}
                </span>
              </div>
            );
          })}

        </div>

        {order.status === "cancelled" && (
          <div className="order-cancelled">
            This order has been cancelled.
          </div>
        )}

      </section>

      {/* ORDER ITEMS */}

      <section className="order-items">

        <h2>Items</h2>

        {order.items.map((item, index) => (
          <article
            className="order-item"
            key={index}
          >

            <div className="order-item-image">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                />
              ) : (
                <span>AROVA</span>
              )}
            </div>

            <div className="order-item-info">

              <h3>{item.name}</h3>

              <p>
                Quantity: {item.quantity}
              </p>

              <strong>
                ₹
                {Number(
                  item.priceAtPurchase
                ).toLocaleString("en-IN")}
              </strong>

            </div>

            <strong>
              ₹
              {Number(
                item.subtotal
              ).toLocaleString("en-IN")}
            </strong>

          </article>
        ))}

      </section>

      {/* SHIPPING */}

      <section className="order-address">

        <h2>Delivery Address</h2>

        <p>
          <strong>
            {order.shippingAddress.fullName}
          </strong>
        </p>

        <p>
          {order.shippingAddress.line1}
        </p>

        {order.shippingAddress.line2 && (
          <p>
            {order.shippingAddress.line2}
          </p>
        )}

        <p>
          {order.shippingAddress.city},{" "}
          {order.shippingAddress.state}
        </p>

        <p>
          {order.shippingAddress.postalCode}
        </p>

        <p>
          Phone: {order.shippingAddress.phone}
        </p>

      </section>

      {/* PAYMENT + TOTAL */}

      <section className="order-summary">

        <h2>Payment & Summary</h2>

        <div>
          <span>Payment Method</span>
          <strong>
            {order.payment.method === "cod"
              ? "Cash on Delivery"
              : "Online Payment"}
          </strong>
        </div>

        <div>
          <span>Payment Status</span>
          <strong>
            {order.payment.status}
          </strong>
        </div>

        <div>
          <span>Subtotal</span>
          <strong>
            ₹
            {Number(
              order.pricing.subtotal
            ).toLocaleString("en-IN")}
          </strong>
        </div>

        <div>
          <span>Shipping</span>
          <strong>
            {order.pricing.shipping === 0
              ? "FREE"
              : `₹${Number(
                  order.pricing.shipping
                ).toLocaleString("en-IN")}`}
          </strong>
        </div>

        {order.pricing.discount > 0 && (
          <div>
            <span>Discount</span>
            <strong>
              − ₹
              {Number(
                order.pricing.discount
              ).toLocaleString("en-IN")}
            </strong>
          </div>
        )}

        <div className="order-total">
          <span>Total</span>

          <strong>
            ₹
            {Number(
              order.pricing.total
            ).toLocaleString("en-IN")}
          </strong>
        </div>

      </section>

    </main>
  );
};

export default OrderDetails;