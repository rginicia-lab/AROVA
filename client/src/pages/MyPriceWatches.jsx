import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const MyPriceWatches = () => {
  const navigate = useNavigate();

  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPriceWatches();
  }, []);

  const fetchPriceWatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/v1/price-watches");

setWatches(response.data?.watches || []);
    } catch (err) {
      console.error("Failed to fetch price watches:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your price watches."
      );
    } finally {
      setLoading(false);
    }
  };

  const getProduct = (watch) => {
    return watch.product || watch.productId || {};
  };

  const getProductId = (watch) => {
    const product = getProduct(watch);

    return product._id || product.id || watch.productId;
  };

  const getProductName = (watch) => {
    const product = getProduct(watch);

    return product.name || product.title || "Product";
  };

  const getProductImage = (watch) => {
    const product = getProduct(watch);

    if (product.images?.length) {
      return product.images[0];
    }

    return product.image || product.imageUrl || "";
  };

  const getCurrentPrice = (watch) => {
    const product = getProduct(watch);

    return (
      product.price ??
      watch.currentPrice ??
      watch.price ??
      0
    );
  };

  const getTargetPrice = (watch) => {
    return (
      watch.targetPrice ??
      watch.desiredPrice ??
      watch.priceTarget ??
      null
    );
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === "") {
      return "—";
    }

    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <main className="price-watches-page">
        <div className="price-watches-loading">
          <span className="arova-label">AROVA</span>
          <h2>Loading your price watches...</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="price-watches-page">
      <section className="price-watches-header">
        <div>
          <p className="arova-label">AROVA INTELLIGENCE</p>

          <h1>
            PRICE
            <span>WATCHES.</span>
          </h1>

          <p className="price-watches-subtitle">
            Keep an eye on products you want and discover
            when the price becomes better.
          </p>
        </div>

        <button
          className="price-watches-back"
          onClick={() => navigate("/shop")}
        >
          ← Continue Shopping
        </button>
      </section>

      {error && (
        <div className="price-watches-error">
          {error}
        </div>
      )}

      {!error && watches.length === 0 && (
        <section className="empty-price-watches">
          <div className="empty-price-icon">◉</div>

          <p className="arova-label">NOTHING WATCHED YET</p>

          <h2>Start watching products.</h2>

          <p>
            Add a price watch from any product page and
            track it here.
          </p>

          <button
            onClick={() => navigate("/shop")}
          >
            Explore Products
          </button>
        </section>
      )}

      {!error && watches.length > 0 && (
        <section className="price-watches-grid">
          {watches.map((watch) => {
            const productId = getProductId(watch);
            const productName = getProductName(watch);
            const image = getProductImage(watch);
            const currentPrice = getCurrentPrice(watch);
            const targetPrice = getTargetPrice(watch);

            const targetReached =
              targetPrice !== null &&
              Number(currentPrice) <= Number(targetPrice);

            return (
              <article
                className={`price-watch-card ${
                  targetReached ? "price-target-reached" : ""
                }`}
                key={watch._id || watch.id || productId}
              >
                <div className="price-watch-image">
                  {image ? (
                    <img
                      src={image}
                      alt={productName}
                    />
                  ) : (
                    <div className="price-watch-image-placeholder">
                      AROVA
                    </div>
                  )}

                  {targetReached && (
                    <span className="price-reached-badge">
                      TARGET REACHED
                    </span>
                  )}
                </div>

                <div className="price-watch-info">
                  <p className="product-category">
                    PRICE WATCH
                  </p>

                  <h2>{productName}</h2>

                  <div className="price-watch-prices">
                    <div>
                      <span>Current Price</span>
                      <strong>
                        {formatPrice(currentPrice)}
                      </strong>
                    </div>

                    <div>
                      <span>Your Target</span>
                      <strong>
                        {formatPrice(targetPrice)}
                      </strong>
                    </div>
                  </div>

                  <div className="price-watch-status">
                    {targetReached ? (
                      <span className="price-status-success">
                        ✓ Your target price has been reached
                      </span>
                    ) : (
                      <span className="price-status-watching">
                        ● Watching for a better price
                      </span>
                    )}
                  </div>

                  <button
                    className="price-watch-view-button"
                    onClick={() =>
                      productId &&
                      navigate(`/product/${productId}`)
                    }
                  >
                    View Product →
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

export default MyPriceWatches;