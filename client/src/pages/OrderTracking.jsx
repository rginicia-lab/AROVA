import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/order-tracking.css";

const steps = [
  "placed",
  "confirmed",
  "shipped",
  "delivered",
];

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Invalid order.");
      setLoading(false);
      return;
    }

    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/v1/orders/${id}`
      );

      console.log("Order API response:", response.data);

      if (response.data?.success && response.data?.order) {
        setOrder(response.data.order);
      } else {
        setError(
          response.data?.message ||
            "Order not found."
        );
      }
    } catch (err) {
      console.error(
        "Order tracking error:",
        err
      );

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

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="order-tracking-page">
        <h2>Loading order...</h2>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !order) {
    return (
      <main className="order-tracking-page">
        <h2>
          {error || "Order not found"}
        </h2>

        <button
          onClick={() => navigate("/orders")}
        >
          Back to Orders
        </button>
      </main>
    );
  }

  const currentIndex =
    steps.indexOf(order.status);

  return (
    <main className="order-tracking-page">

      {/* BACK */}

      <button
        className="back-button"
        onClick={() => navigate("/orders")}
      >
        ← My Orders
      </button>

      {/* HEADER */}

      <header className="tracking-header">
        <p>AROVA</p>

        <h1>Track Your Order</h1>

        <span>
          Order #
          {order._id
            .slice(-8)
            .toUpperCase()}
        </span>
      </header>

      {/* TRACKING */}

      {order.status === "cancelled" ? (
        <section className="cancelled-order">

          <h2>Order Cancelled</h2>

          <p>
            This order has been cancelled.
          </p>

        </section>
      ) : (
        <section className="tracking-card">

          <div className="tracking-steps">

            {steps.map(
              (step, index) => {

                const completed =
                  index <= currentIndex;

                return (
                  <div
                    className={
                      completed
                        ? "tracking-step completed"
                        : "tracking-step"
                    }
                    key={step}
                  >

                    <div className="tracking-circle">
                      {completed
                        ? "✓"
                        : index + 1}
                    </div>

                    <strong>
                      {step
                        .charAt(0)
                        .toUpperCase() +
                        step.slice(1)}
                    </strong>

                    {index <
                      steps.length - 1 && (
                      <div
                        className={
                          index <
                          currentIndex
                            ? "tracking-line completed"
                            : "tracking-line"
                        }
                      />
                    )}

                  </div>
                );
              }
            )}

          </div>

          <div className="current-status">

            <span>
              Current Status
            </span>

            <strong>
              {order.status
                .charAt(0)
                .toUpperCase() +
                order.status.slice(1)}
            </strong>

          </div>

        </section>
      )}

      {/* ORDER DETAILS */}

      <section className="tracking-order-details">

        <h2>Order Details</h2>

        {order.items?.map(
          (item, index) => (
            <div
              className="tracking-item"
              key={index}
            >

              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                />
              )}

              <div>
                <h3>{item.name}</h3>

                <p>
                  Quantity: {item.quantity}
                </p>

                <p>
                  ₹
                  {Number(
                    item.priceAtPurchase || 0
                  ).toLocaleString("en-IN")}{" "}
                  each
                </p>
              </div>

              <strong>
                ₹
                {Number(
                  item.subtotal || 0
                ).toLocaleString("en-IN")}
              </strong>

            </div>
          )
        )}

        <div className="tracking-total">

          <span>Total</span>

          <strong>
            ₹
            {Number(
              order.pricing?.total || 0
            ).toLocaleString("en-IN")}
          </strong>

        </div>

      </section>

    </main>
  );
};

export default OrderTracking;