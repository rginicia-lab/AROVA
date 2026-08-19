import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const statuses = [
  "placed",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const AdminOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/v1/admin/orders");

      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (err) {
      console.error("Admin orders error:", err);

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

  const updateStatus = async (orderId, status) => {
    try {
      setUpdating(orderId);

      const response = await api.patch(
        `/v1/admin/orders/${orderId}/status`,
        { status }
      );

      if (response.data.success) {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order._id === orderId
              ? response.data.order
              : order
          )
        );
      }
    } catch (err) {
      console.error("Status update error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <main className="admin-orders-page">
        Loading orders...
      </main>
    );
  }

  return (
    <main className="admin-orders-page">
      <header className="admin-orders-header">
        <div>
          <p>AROVA ADMIN</p>
          <h1>Order Management</h1>
          <span>
            View and manage customer orders.
          </span>
        </div>

        <button onClick={() => navigate("/admin")}>
          ← Dashboard
        </button>
      </header>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <section className="admin-empty">
          <h2>No orders yet</h2>
          <p>
            Customer orders will appear here.
          </p>
        </section>
      ) : (
        <section className="admin-orders-list">
          {orders.map((order) => (
            <article
              className="admin-order-card"
              key={order._id}
            >
              <div className="admin-order-top">
                <div>
                  <span>Order ID</span>
                  <strong>
                    #{order._id
                      .slice(-8)
                      .toUpperCase()}
                  </strong>
                </div>

                <div>
                  <span>Customer</span>
                  <strong>
                    {order.user?.name ||
                      "Customer"}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {order.user?.email || "-"}
                  </strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong>
                    ₹
                    {Number(
                      order.pricing?.total || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="admin-order-items">
                {order.items.map(
                  (item, index) => (
                    <div
                      className="admin-order-item"
                      key={`${order._id}-${index}`}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                        />
                      )}

                      <div>
                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="admin-order-bottom">
                <div>
                  <span>Status</span>

                  <strong
                    className={`status-${order.status}`}
                  >
                    {order.status
                      .charAt(0)
                      .toUpperCase() +
                      order.status.slice(1)}
                  </strong>
                </div>

                <div>
                  <span>Payment</span>

                  <strong>
                    {order.payment?.method ===
                    "cod"
                      ? "Cash on Delivery"
                      : "Online"}
                  </strong>
                </div>

                <div>
                  <span>Update Status</span>

                  <select
                    value={order.status}
                    disabled={
                      updating === order._id
                    }
                    onChange={(e) =>
                      updateStatus(
                        order._id,
                        e.target.value
                      )
                    }
                  >
                    {statuses.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status
                          .charAt(0)
                          .toUpperCase() +
                          status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default AdminOrders;