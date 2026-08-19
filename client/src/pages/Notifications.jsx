import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/notifications.css";

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/v1/notifications");

      if (response.data?.success) {
        setNotifications(
          response.data.notifications || []
        );

        setUnreadCount(
          response.data.unreadCount || 0
        );
      }
    } catch (err) {
      console.error(
        "Notifications error:",
        err
      );

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await api.patch(
        `/v1/notifications/${notificationId}/read`
      );

      if (response.data?.success) {
        setNotifications((previous) =>
          previous.map((notification) =>
            notification._id === notificationId
              ? {
                  ...notification,
                  isRead: true,
                }
              : notification
          )
        );

        setUnreadCount((count) =>
          Math.max(count - 1, 0)
        );
      }
    } catch (err) {
      console.error(
        "Mark notification error:",
        err
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await api.patch(
        "/v1/notifications/read-all"
      );

      if (response.data?.success) {
        setNotifications((previous) =>
          previous.map((notification) => ({
            ...notification,
            isRead: true,
          }))
        );

        setUnreadCount(0);
      }
    } catch (err) {
      console.error(
        "Mark all notifications error:",
        err
      );
    }
  };

  const handleNotificationClick = async (
    notification
  ) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    if (notification.order?._id) {
      navigate(
        `/orders/${notification.order._id}`
      );
      return;
    }

    if (notification.product?._id) {
      navigate(
        `/product/${notification.product._id}`
      );
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return "📦";

      case "order_status":
        return "🚚";

      case "price_watch":
        return "💰";

      case "reward":
        return "🎁";

      case "coupon":
        return "🏷️";

      default:
        return "🔔";
    }
  };

  if (loading) {
    return (
      <main className="notifications-page">
        <div className="notifications-loading">
          <span>AROVA</span>
          <h2>
            Loading notifications...
          </h2>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="notifications-page">
        <div className="notifications-error">
          <span>AROVA</span>

          <h1>Notifications</h1>

          <p>{error}</p>

          <button
            className="notification-button"
            onClick={() => navigate("/shop")}
          >
            Back to Shop
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="notifications-page">

      {/* HEADER */}

      <header className="notifications-header">

        <button
          className="back-button"
          onClick={() => navigate("/shop")}
        >
          ← Back to Shop
        </button>

        <div className="notifications-title">

          <span>AROVA</span>

          <h1>
            Notifications
          </h1>

          <p>
            Stay updated with your AROVA activity.
          </p>

        </div>

        {unreadCount > 0 && (
          <button
            className="mark-all-button"
            onClick={markAllAsRead}
          >
            Mark All as Read
          </button>
        )}

      </header>

      {/* SUMMARY */}

      <section className="notification-summary">

        <div className="notification-summary-card">

          <span>
            Total Notifications
          </span>

          <strong>
            {notifications.length}
          </strong>

        </div>

        <div className="notification-summary-card">

          <span>
            Unread
          </span>

          <strong>
            {unreadCount}
          </strong>

        </div>

      </section>

      {/* NOTIFICATIONS */}

      <section className="notification-list">

        {notifications.length === 0 ? (
          <div className="empty-notifications">

            <div className="empty-notification-icon">
              🔔
            </div>

            <h2>
              No notifications yet
            </h2>

            <p>
              We'll let you know when
              something important happens.
            </p>

            <button
              className="notification-button"
              onClick={() => navigate("/shop")}
            >
              Continue Shopping
            </button>

          </div>
        ) : (
          notifications.map(
            (notification) => (
              <article
                key={notification._id}
                className={`notification-card ${
                  notification.isRead
                    ? "read"
                    : "unread"
                }`}
                onClick={() =>
                  handleNotificationClick(
                    notification
                  )
                }
              >

                <div className="notification-icon">
                  {getNotificationIcon(
                    notification.type
                  )}
                </div>

                <div className="notification-content">

                  <div className="notification-top">

                    <h3>
                      {notification.title ||
                        "AROVA Notification"}
                    </h3>

                    {!notification.isRead && (
                      <span className="unread-dot" />
                    )}

                  </div>

                  <p>
                    {notification.message ||
                      notification.description ||
                      "You have a new notification."}
                  </p>

                  {notification.order && (
                    <span className="notification-meta">
                      Order Status:{" "}
                      {notification.order.status}
                    </span>
                  )}

                  {notification.product && (
                    <span className="notification-meta">
                      Product:{" "}
                      {notification.product.name}
                    </span>
                  )}

                  <small>
                    {notification.createdAt
                      ? new Date(
                          notification.createdAt
                        ).toLocaleString(
                          "en-IN"
                        )
                      : ""}
                  </small>

                </div>

                {!notification.isRead && (
                  <button
                    className="read-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      markAsRead(
                        notification._id
                      );
                    }}
                  >
                    Mark Read
                  </button>
                )}

              </article>
            )
          )
        )}

      </section>

      {/* REFRESH */}

      <div className="notifications-footer">

        <button
          className="refresh-notifications"
          onClick={fetchNotifications}
        >
          ↻ Refresh Notifications
        </button>

      </div>

    </main>
  );
};

export default Notifications;