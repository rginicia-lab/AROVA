import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/v1/admin/analytics");

      if (response.data.success) {
        setAnalytics(response.data);
      }
    } catch (err) {
      console.error("Admin analytics error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError("You do not have admin permission.");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="admin-page">
        <h2>Loading dashboard...</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-page">
        <h2>{error}</h2>

        <button onClick={() => navigate("/shop")}>
          Back to Shop
        </button>
      </main>
    );
  }

  const summary = analytics?.summary || {};

  return (
    <main className="admin-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="admin-header">
        <div>
          <p>AROVA ADMIN</p>

          <h1>Dashboard</h1>

          <span>
            Manage your AROVA store.
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate("/shop")}
        >
          View Store
        </button>
      </header>

      {/* =========================
          STATISTICS
      ========================= */}

      <section className="admin-stats">

        <div className="admin-stat-card">
          <span>Total Orders</span>

          <strong>
            {summary.totalOrders || 0}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>Total Revenue</span>

          <strong>
            ₹
            {Number(
              summary.totalRevenue || 0
            ).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>Average Order</span>

          <strong>
            ₹
            {Number(
              summary.averageOrderValue || 0
            ).toLocaleString("en-IN")}
          </strong>
        </div>

      </section>

      {/* =========================
          ADMIN ACTIONS
      ========================= */}

      <section className="admin-actions">

        <button
          type="button"
          onClick={() =>
            navigate("/admin/inventory")
          }
        >
          Manage Inventory
        </button>

        <button
  onClick={() => navigate("/admin/coupons")}
>
  Manage Coupons
</button>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/reviews")
          }
        >
          ⭐ Review Management
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/orders")
          }
        >
          Manage Orders
        </button>

        <button
          type="button"
          onClick={fetchAnalytics}
        >
          Refresh Analytics
        </button>

      </section>

      {/* =========================
          ORDER STATUS
      ========================= */}

      <section className="admin-section">

        <h2>Order Status</h2>

        <div className="status-list">

          {analytics?.ordersByStatus?.length ? (

            analytics.ordersByStatus.map((item) => (

              <div
                className="status-card"
                key={item._id}
              >

                <span>
                  {item._id
                    ? item._id
                        .charAt(0)
                        .toUpperCase() +
                      item._id.slice(1)
                    : "Unknown"}
                </span>

                <strong>
                  {item.count}
                </strong>

              </div>

            ))

          ) : (

            <p>No orders yet.</p>

          )}

        </div>

      </section>

      {/* =========================
          RECENT SALES
      ========================= */}

      <section className="admin-section">

        <h2>Recent Sales</h2>

        {analytics?.salesByDay?.length ? (

          <div className="sales-list">

            {analytics.salesByDay
              .slice(-7)
              .map((day) => (

                <div
                  className="sales-row"
                  key={day._id}
                >

                  <span>
                    {day._id}
                  </span>

                  <span>
                    {day.orders} orders
                  </span>

                  <strong>
                    ₹
                    {Number(
                      day.revenue || 0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

              ))}

          </div>

        ) : (

          <p>
            No sales data available.
          </p>

        )}

      </section>

    </main>
  );
};

export default AdminDashboard;