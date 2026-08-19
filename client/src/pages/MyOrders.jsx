import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const MyOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/v1/orders/my");

      if (response.data?.success) {
        setOrders(response.data.orders || []);
      } else {
        setError(
          response.data?.message ||
            "Unable to load orders."
        );
      }
    } catch (err) {
      console.error("My orders error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    return `order-status ${status}`;
  };

  if (loading) {
    return (
      <main className="orders-page">
        <h2>Loading your orders...</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="orders-page">
        <button
          className="back-button"
          onClick={() => navigate("/shop")}
        >
          ← Back to Shop
        </button>

        <div className="orders-error">
          <h2>{error}</h2>

          <button onClick={fetchOrders}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page">

      {/* HEADER */}

      <button
        className="back-button"
        onClick={() => navigate("/shop")}
      >
        ← Continue Shopping
      </button>

      <header className="orders-header">
        <p>AROVA</p>

        <h1>My Orders</h1>

        <span>
          Track and manage your AROVA purchases.
        </span>
      </header>

      {/* EMPTY */}

      {orders.length === 0 ? (
        <section className="empty-orders">

          <h2>No orders yet</h2>

          <p>
            You haven't placed any orders yet.
            Start shopping and your orders will
            appear here.
          </p>

          <button
            onClick={() => navigate("/shop")}
          >
            Explore Products
          </button>

        </section>
      ) : (

        /* ORDERS */

        <section className="orders-list">

          {orders.map((order) => {

            const total = Number(
              order.pricing?.total || 0
            );

            const itemCount =
              order.items?.reduce(
                (sum, item) =>
                  sum + Number(item.quantity || 0),
                0
              ) || 0;

            return (
              <article
                className="order-card"
                key={order._id}
              >

                {/* ORDER HEADER */}

                <div className="order-card-header">

                  <div>
                    <span className="order-label">
                      Order
                    </span>

                    <h2>
                      #
                      {order._id
                        .slice(-8)
                        .toUpperCase()}
                    </h2>
                  </div>

                  <span
                    className={getStatusClass(
                      order.status
                    )}
                  >
                    {order.status
                      ?.charAt(0)
                      .toUpperCase() +
                      order.status?.slice(1)}
                  </span>

                </div>

                {/* DATE */}

                <div className="order-meta">

                  <span>
                    Ordered on{" "}
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>

                  <span>
                    {itemCount}{" "}
                    {itemCount === 1
                      ? "item"
                      : "items"}
                  </span>

                </div>

                {/* ITEMS */}

                <div className="order-items">

                  {order.items?.map(
                    (item, index) => (
                      <div
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
                            <span>
                              AROVA
                            </span>
                          )}

                        </div>

                        <div className="order-item-info">

                          <h3>
                            {item.name}
                          </h3>

                          <p>
                            Quantity:{" "}
                            {item.quantity}
                          </p>

                          <span>
                            ₹
                            {Number(
                              item.priceAtPurchase
                            ).toLocaleString(
                              "en-IN"
                            )}{" "}
                            each
                          </span>

                        </div>

                        <strong>
                          ₹
                          {Number(
                            item.subtotal
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </div>
                    )
                  )}

                </div>

                {/* FOOTER */}

                <div className="order-card-footer">

                  <div className="order-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {total.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                  <button
                    className="track-order-button"
                    onClick={() =>
                      navigate(
                        `/orders/${order._id}`
                      )
                    }
                  >
                    Track Order →
                  </button>

                </div>

              </article>
            );
          })}

        </section>
      )}

    </main>
  );
};

export default MyOrders;