import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminReviews = () => {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/v1/admin/reviews");

      if (response.data.success) {
        setReviews(response.data.reviews || []);
      }
    } catch (err) {
      console.error("Admin reviews error:", err);

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
          "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reviewId, status) => {
    try {
      await api.patch(
        `/v1/admin/reviews/${reviewId}/status`,
        { status }
      );

      setReviews((currentReviews) =>
        currentReviews.map((review) =>
          review._id === reviewId
            ? { ...review, status }
            : review
        )
      );
    } catch (err) {
      console.error("Update review error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to update review."
      );
    }
  };

  if (loading) {
    return (
      <main className="admin-page">
        <h2>Loading reviews...</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-page">
        <h2>{error}</h2>

        <button
          onClick={() => navigate("/admin")}
        >
          Back to Dashboard
        </button>
      </main>
    );
  }

  return (
    <main className="admin-page">

      <header className="admin-header">
        <div>
          <p>AROVA ADMIN</p>

          <h1>Review Management</h1>

          <span>
            Manage customer product reviews.
          </span>
        </div>

        <button
          onClick={() => navigate("/admin")}
        >
          ← Dashboard
        </button>
      </header>

      <section className="admin-section">

        <h2>
          Customer Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p>No reviews available.</p>
        ) : (
          <div className="admin-reviews-list">

            {reviews.map((review) => (

              <article
                className="admin-review-card"
                key={review._id}
              >

                <div className="admin-review-header">

                  <div>
                    <h3>
                      {review.product?.name ||
                        "Product"}
                    </h3>

                    <p>
                      Customer:{" "}
                      {review.user?.name ||
                        "Unknown"}
                    </p>

                    <small>
                      {review.user?.email ||
                        ""}
                    </small>
                  </div>

                  <span
                    className={
                      review.status === "visible"
                        ? "review-visible"
                        : "review-hidden"
                    }
                  >
                    {review.status}
                  </span>

                </div>

                <div className="admin-review-rating">
                  {"⭐".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </div>

                <p className="admin-review-comment">
                  {review.comment ||
                    "No comment provided."}
                </p>

                <p className="admin-review-date">
                  {new Date(
                    review.createdAt
                  ).toLocaleDateString("en-IN")}
                </p>

                <div className="admin-review-actions">

                  {review.status === "visible" ? (
                    <button
                      onClick={() =>
                        updateStatus(
                          review._id,
                          "hidden"
                        )
                      }
                    >
                      Hide Review
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        updateStatus(
                          review._id,
                          "visible"
                        )
                      }
                    >
                      Show Review
                    </button>
                  )}

                </div>

              </article>

            ))}

          </div>
        )}

      </section>

    </main>
  );
};

export default AdminReviews;