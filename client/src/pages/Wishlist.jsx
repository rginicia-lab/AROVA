import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/wishlist.css";

const Wishlist = () => {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/v1/wishlist");

      if (response.data.success) {
        setWishlist(
          response.data.wishlist?.products || []
        );
      }
    } catch (err) {
      console.error("Wishlist error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load wishlist."
      );
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      await api.post("/v1/cart/items", {
        productId,
        quantity: 1,
      });

      alert("Product added to cart!");
    } catch (err) {
      console.error("Cart error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      alert(
        err.response?.data?.message ||
          "Unable to add product to cart."
      );
    }
  };

  // REMOVE FROM WISHLIST
  const removeFromWishlist = async (productId) => {
    try {
      const response = await api.delete(
        `/v1/wishlist/items/${productId}`
      );

      if (response.data.success) {
        setWishlist(
          response.data.wishlist?.products || []
        );
      }
    } catch (err) {
      console.error(
        "Remove wishlist error:",
        err
      );

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      alert(
        err.response?.data?.message ||
          "Unable to remove product."
      );
    }
  };

  if (loading) {
    return (
      <main className="wishlist-page">
        <h2>Loading wishlist...</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="wishlist-page">
        <h2>{error}</h2>

        <button onClick={() => navigate("/shop")}>
          Continue Shopping
        </button>
      </main>
    );
  }

  return (
    <main className="wishlist-page">

      <button
        className="back-button"
        onClick={() => navigate("/shop")}
      >
        ← Continue Shopping
      </button>

      <div className="wishlist-header">
        <p>AROVA</p>

        <h1>My Wishlist</h1>

        <span>
          {wishlist.length} saved product
          {wishlist.length !== 1 ? "s" : ""}
        </span>
      </div>

      {wishlist.length === 0 ? (
        <section className="empty-wishlist">

          <h2>Your wishlist is empty</h2>

          <p>
            Save products you love and find them here
            later.
          </p>

          <button
            onClick={() => navigate("/shop")}
          >
            Explore Products
          </button>

        </section>
      ) : (
        <section className="wishlist-grid">

          {wishlist.map((item) => {
            const product = item.product;

            if (!product) return null;

            return (
              <article
                className="wishlist-card"
                key={product._id}
              >

                <div
                  className="wishlist-image"
                  onClick={() =>
                    navigate(
                      `/product/${product._id}`
                    )
                  }
                >
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                    />
                  ) : (
                    <span>AROVA</span>
                  )}
                </div>

                <div className="wishlist-info">

                  <h3>{product.name}</h3>

                  <p>
                    ₹
                    {Number(
                      product.price
                    ).toLocaleString("en-IN")}
                  </p>

                  {product.averageRating !==
                    undefined && (
                    <span>
                      ⭐{" "}
                      {Number(
                        product.averageRating
                      ).toFixed(1)}
                    </span>
                  )}

                  <button
                    onClick={() =>
                      addToCart(product._id)
                    }
                    disabled={
                      product.stock <= 0
                    }
                  >
                    {product.stock > 0
                      ? "Add to Cart"
                      : "Out of Stock"}
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        `/product/${product._id}`
                      )
                    }
                  >
                    View Product
                  </button>

                  {/* REMOVE BUTTON */}
                  <button
                    className="remove-wishlist-button"
                    onClick={() =>
                      removeFromWishlist(
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

        </section>
      )}

    </main>
  );
};

export default Wishlist;