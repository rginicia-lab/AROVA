import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/orders.css";

const Orders = () => {
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

      console.log("Orders API response:", response.data);

      if (response.data?.success) {
        setOrders(response.data.orders || []);
      } else {
        setError(
          response.data?.message ||
            "Unable to load orders."
        );
      }
    } catch (err) {
      console.error("Orders error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="orders-page">
        <h2>Loading orders...</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="orders-page">
        <h2>{error}</h2>

        <button onClick={fetchOrders}>
          Try Again
        </button>
      </main>
    );
  }

  return (
    <main className="orders-page">

      <button
        className="back-button"
        onClick={() => navigate("/")}
      >
        ← Home
      </button>

      <header className="orders-header">
        <p>AROVA</p>
        <h1>My Orders</h1>
        <span>
          View and track your orders
        </span>
      </header>

      {orders.length === 0 ? (
        <section className="empty-orders">
          <h2>No orders yet</h2>

          <p>
            You haven't placed any orders yet.
          </p>

          <button
            onClick={() => navigate("/shop")}
          >
            Start Shopping
          </button>
        </section>
      ) : (
        <section className="orders-list">

          {orders.map((order) => (
            <article
              className="order-card"
              key={order._id}
            >

              <div className="order-card-header">

                <div>
                  <span>Order</span>

                  <h3>
                    #
                    {order._id
                      .slice(-8)
                      .toUpperCase()}
                  </h3>
                </div>

                <div className="order-status">
                  {order.status}
                </div>

              </div>

              <div className="order-items">

                {order.items?.slice(0, 3).map(
                  (item, index) => (
                    <div
                      className="order-item"
                      key={index}
                    >

                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                        />
                      ) : (
                        <div className="order-item-image">
                          AROVA
                        </div>
                      )}

                      <div>
                        <h4>{item.name}</h4>

                        <p>
                          Qty: {item.quantity}
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

              </div>

              <div className="order-card-footer">

                <div>
                  <span>Total</span>

                  <strong>
                    ₹
                    {Number(
                      order.pricing?.total || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <button
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
          ))}

        </section>
      )}

    </main>
  );
};

export default Orders;