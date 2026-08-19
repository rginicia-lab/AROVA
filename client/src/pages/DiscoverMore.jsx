import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const DiscoverMore = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH AROVA PICKS
  // =====================================================

  useEffect(() => {
    fetchArovaPicks();
  }, []);

  const fetchArovaPicks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/v1/discovery/picks"
      );

      console.log(
        "AROVA Picks response:",
        response.data
      );

      if (response.data?.success) {
        setProducts(
          Array.isArray(response.data.products)
            ? response.data.products
            : []
        );
      } else {
        setError(
          response.data?.message ||
            "Unable to load recommendations."
        );
      }
    } catch (err) {
      console.error(
        "Discover More error:",
        err
      );

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load Discover More."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RECORD PRODUCT VIEW
  // =====================================================

  const recordProductView = async (
    productId
  ) => {
    try {
      await api.post(
        `/v1/discovery/views/${productId}`
      );
    } catch (err) {
      console.error(
        "Unable to record product view:",
        err
      );
    }
  };

  // =====================================================
  // OPEN PRODUCT
  // =====================================================

  const openProduct = async (productId) => {
    await recordProductView(productId);

    navigate(`/products/${productId}`);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="discover-page">

        <section className="discover-loading">

          <div className="discover-loading-icon">
            ✦
          </div>

          <h2>
            Discovering products...
          </h2>

          <p>
            Finding something you may love.
          </p>

        </section>

      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <main className="discover-page">

        <section className="discover-error">

          <p className="discover-label">
            AROVA DISCOVERY
          </p>

          <h1>
            Something went wrong
          </h1>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={fetchArovaPicks}
          >
            Try Again
          </button>

        </section>

      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="discover-page">

      {/* ================================================
          HEADER
      ================================================= */}

      <section className="discover-header">

        <p className="discover-label">
          AROVA DISCOVERY
        </p>

        <h1>
          Discover More.
        </h1>

        <p>
          Explore products selected
          specially for you.
        </p>

      </section>

      {/* ================================================
          PRODUCTS
      ================================================= */}

      {products.length > 0 ? (

        <section className="discover-grid">

          {products.map((product) => (

            <article
              className="discover-card"
              key={product._id}
              onClick={() =>
                openProduct(product._id)
              }
            >

              {/* PRODUCT IMAGE */}

              <div className="discover-image">

                {product.images?.length > 0 ? (

                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                  />

                ) : (

                  <div className="no-image">
                    No Image
                  </div>

                )}

              </div>

              {/* PRODUCT INFORMATION */}

              <div className="discover-info">

                {/* CATEGORY */}

                <p className="discover-category">

                  {product.category?.name ||
                    "AROVA"}

                </p>

                {/* NAME */}

                <h3>
                  {product.name}
                </h3>

                {/* BRAND */}

                {product.brand && (

                  <p className="discover-brand">
                    {product.brand}
                  </p>

                )}

                {/* RATING */}

                <div className="discover-rating">

                  <span>
                    ⭐
                  </span>

                  <strong>
                    {Number(
                      product.averageRating || 0
                    ).toFixed(1)}
                  </strong>

                  <span>
                    (
                    {product.reviewCount || 0}
                    )
                  </span>

                </div>

                {/* PRICE */}

                <div className="discover-bottom">

                  <strong className="discover-price">

                    ₹
                    {Number(
                      product.price || 0
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </strong>

                  <span className="discover-view">

                    View →

                  </span>

                </div>

              </div>

            </article>

          ))}

        </section>

      ) : (

        /* ================================================
           EMPTY STATE
        ================================================= */

        <section className="discover-empty">

          <div className="discover-empty-icon">
            ✦
          </div>

          <h2>
            Nothing to discover yet.
          </h2>

          <p>
            Explore more products to help
            AROVA understand your interests.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/shop")
            }
          >
            Explore Shop
          </button>

        </section>

      )}

    </main>
  );
};

export default DiscoverMore;