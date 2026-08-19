import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/product-details.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================
  // PRODUCT STATE
  // =========================

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // CART STATE
  // =========================

  const [addingToCart, setAddingToCart] = useState(false);

  // =========================
  // WISHLIST STATE
  // =========================

  const [addingToWishlist, setAddingToWishlist] = useState(false);

  // =========================
  // PRICE WATCH STATE
  // =========================

  const [addingToPriceWatch, setAddingToPriceWatch] =
    useState(false);

  // =========================
  // REVIEW STATE
  // =========================

  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // =========================
  // FETCH PRODUCT
  // =========================

  useEffect(() => {
    if (!id) {
      setError("Invalid product.");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/v1/products/${id}`);

        console.log("Product API response:", response.data);

        if (
          response.data?.success &&
          response.data?.product
        ) {
          const productData = response.data.product;

          setProduct(productData);

          if (
            productData.images &&
            productData.images.length > 0
          ) {
            setSelectedImage(productData.images[0]);
          }

          return;
        }

        setError(
          response.data?.message ||
            "Product not found"
        );
      } catch (err) {
        console.error(
          "Product fetch error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // =========================
  // FETCH REVIEWS
  // =========================

  useEffect(() => {
    if (!id) return;

    const fetchReviews = async () => {
      try {
        setReviewLoading(true);

        const response = await api.get(
          `/v1/reviews/product/${id}`
        );

        console.log(
          "Reviews API response:",
          response.data
        );

        if (response.data?.success) {
          setReviews(
            response.data.reviews || []
          );
        }
      } catch (err) {
        console.error(
          "Reviews fetch error:",
          err
        );
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  // =========================
  // ADD TO CART
  // =========================

  const addToCart = async () => {
    if (!product || product.stock <= 0) {
      return;
    }

    try {
      setAddingToCart(true);

      await api.post("/v1/cart/items", {
        productId: product._id,
        quantity,
      });

      alert("Product added to cart!");
    } catch (err) {
      console.error(
        "Add to cart error:",
        err
      );

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      alert(
        err.response?.data?.message ||
          "Unable to add product to cart."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // =========================
  // ADD TO WISHLIST
  // =========================

  const addToWishlist = async () => {
    if (!product) {
      return;
    }

    try {
      setAddingToWishlist(true);

      await api.post(
        "/v1/wishlist/items",
        {
          productId: product._id,
        }
      );

      alert(
        "Product added to wishlist!"
      );
    } catch (err) {
      console.error(
        "Wishlist error:",
        err
      );

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      alert(
        err.response?.data?.message ||
          "Unable to add product to wishlist."
      );
    } finally {
      setAddingToWishlist(false);
    }
  };

  // =========================
  // ADD TO PRICE WATCH
  // =========================

  const handlePriceWatch = async () => {
    if (!product) {
      return;
    }

    try {
      setAddingToPriceWatch(true);

      await api.post("/v1/price-watches", {
        productId: product._id,
      });

      alert("Product added to Price Watch!");

      navigate("/price-watches");
    } catch (err) {
      console.error(
        "Price Watch error:",
        err
      );

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      if (
        err.response?.status === 400 ||
        err.response?.status === 409
      ) {
        alert(
          err.response?.data?.message ||
            "This product is already in your Price Watches."
        );

        navigate("/price-watches");
        return;
      }

      alert(
        err.response?.data?.message ||
          "Unable to add product to Price Watch."
      );
    } finally {
      setAddingToPriceWatch(false);
    }
  };

  // =========================
  // SUBMIT REVIEW
  // =========================

  const submitReview = async () => {
    if (!product) {
      return;
    }

    if (
      !reviewRating ||
      reviewRating < 1 ||
      reviewRating > 5
    ) {
      alert(
        "Please select a rating from 1 to 5."
      );
      return;
    }

    try {
      setSubmittingReview(true);

      const response = await api.post(
        "/v1/reviews",
        {
          productId: product._id,
          rating: reviewRating,
          comment: reviewComment,
        }
      );

      if (response.data?.success) {
        alert(
          "Review submitted successfully!"
        );

        setReviewComment("");
        setReviewRating(5);

        const reviewsResponse =
          await api.get(
            `/v1/reviews/product/${product._id}`
          );

        const updatedReviews =
          reviewsResponse.data?.reviews || [];

        setReviews(updatedReviews);

        const ratingTotal =
          updatedReviews.reduce(
            (sum, review) =>
              sum + Number(review.rating),
            0
          );

        const averageRating =
          updatedReviews.length > 0
            ? Number(
                (
                  ratingTotal /
                  updatedReviews.length
                ).toFixed(1)
              )
            : 0;

        setProduct((previousProduct) => ({
          ...previousProduct,
          averageRating,
          reviewCount:
            updatedReviews.length,
        }));
      }
    } catch (err) {
      console.error(
        "Submit review error:",
        err
      );

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      alert(
        err.response?.data?.message ||
          "Unable to submit review."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="product-loading">
        <h2>Loading product...</h2>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !product) {
    return (
      <main className="product-error">
        <h2>
          {error || "Product not found"}
        </h2>

        <button
          onClick={() =>
            navigate("/shop")
          }
        >
          Back to Shop
        </button>
      </main>
    );
  }

  const images = product.images || [];

  // =========================
  // PAGE
  // =========================

  return (
    <main className="product-details-page">

      {/* BACK */}

      <button
        className="back-button"
        onClick={() =>
          navigate("/shop")
        }
      >
        ← Back to Shop
      </button>

      {/* PRODUCT SECTION */}

      <section className="product-details">

        {/* IMAGE GALLERY */}

        <div className="product-gallery">

          <div className="thumbnail-list">

            {images.map(
              (image, index) => (
                <button
                  key={index}
                  type="button"
                  className={
                    selectedImage === image
                      ? "thumbnail active"
                      : "thumbnail"
                  }
                  onClick={() =>
                    setSelectedImage(image)
                  }
                >
                  <img
                    src={image}
                    alt={`${product.name} ${
                      index + 1
                    }`}
                  />
                </button>
              )
            )}

          </div>

          <div className="main-product-image">

            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
              />
            ) : (
              <div>
                No image available
              </div>
            )}

          </div>

        </div>

        {/* PRODUCT INFORMATION */}

        <div className="product-details-info">

          <p className="product-category">
            {product.category?.name ||
              "AROVA"}
          </p>

          <h1>{product.name}</h1>

          {product.brand && (
            <p className="product-brand">
              {product.brand}
            </p>
          )}

          {/* RATING */}

          <div className="product-rating">
            ⭐{" "}
            {Number(
              product.averageRating || 0
            ).toFixed(1)}

            <span>
              {" "}
              (
              {product.reviewCount || 0}
              {" "}
              reviews)
            </span>
          </div>

          {/* PRICE */}

          <div className="product-price-section">

            <h2>
              ₹
              {Number(
                product.price
              ).toLocaleString("en-IN")}
            </h2>

            {product.originalPrice &&
              product.originalPrice >
                product.price && (
                <span className="original-price">
                  ₹
                  {Number(
                    product.originalPrice
                  ).toLocaleString("en-IN")}
                </span>
              )}

          </div>

          {/* DESCRIPTION */}

          <p className="product-description">
            {product.description}
          </p>

          {/* STOCK */}

          <div className="product-stock">

            {product.stock > 0 ? (
              <span>
                ✓ {product.stock} available
              </span>
            ) : (
              <span>
                Out of stock
              </span>
            )}

          </div>

          {/* QUANTITY */}

          {product.stock > 0 && (
            <div className="quantity-control">

              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() =>
                  setQuantity(
                    (value) =>
                      Math.max(
                        1,
                        value - 1
                      )
                  )
                }
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                disabled={
                  quantity >=
                  product.stock
                }
                onClick={() =>
                  setQuantity(
                    (value) =>
                      Math.min(
                        product.stock,
                        value + 1
                      )
                  )
                }
              >
                +
              </button>

            </div>
          )}

          {/* ADD TO CART */}

          <button
            type="button"
            className="add-cart-button"
            disabled={
              product.stock <= 0 ||
              addingToCart
            }
            onClick={addToCart}
          >
            {product.stock <= 0
              ? "Out of Stock"
              : addingToCart
              ? "Adding..."
              : "Add to Cart"}
          </button>

          {/* VIEW CART */}

          <button
            type="button"
            className="view-cart-button"
            onClick={() =>
              navigate("/cart")
            }
          >
            View Cart
          </button>

          {/* WISHLIST */}

          <button
            type="button"
            className="wishlist-button"
            disabled={addingToWishlist}
            onClick={addToWishlist}
          >
            {addingToWishlist
              ? "Adding..."
              : "♡ Add to Wishlist"}
          </button>

          {/* PRICE WATCH */}

          <button
            type="button"
            className="price-watch-button"
            disabled={addingToPriceWatch}
            onClick={handlePriceWatch}
          >
            {addingToPriceWatch
              ? "Adding..."
              : "♡ Watch Price"}
          </button>

          {/* VIEW PRICE WATCHES */}

          <button
            type="button"
            className="view-price-watches-button"
            onClick={() =>
              navigate("/price-watches")
            }
          >
            View Price Watches
          </button>

          {/* SPECIFICATIONS */}

          {product.specifications &&
            Object.keys(
              product.specifications
            ).length > 0 && (
              <div className="product-specifications">

                <h3>
                  Specifications
                </h3>

                {Object.entries(
                  product.specifications
                ).map(
                  ([key, value]) => (
                    <div
                      className="specification"
                      key={key}
                    >
                      <span>{key}</span>

                      <strong>
                        {value}
                      </strong>
                    </div>
                  )
                )}

              </div>
            )}

          {/* TAGS */}

          {product.tags?.length > 0 && (
            <div className="product-tags">

              {product.tags.map(
                (tag) => (
                  <span
                    key={tag}
                    className="product-tag"
                  >
                    #{tag}
                  </span>
                )
              )}

            </div>
          )}

        </div>

      </section>

      {/* REVIEWS */}

      <section className="product-reviews">

        <div className="reviews-heading">

          <p className="product-category">
            AROVA
          </p>

          <h2>
            Customer Reviews
          </h2>

          <p>
            See what customers think
            about this product.
          </p>

        </div>

        {/* WRITE REVIEW */}

        <div className="write-review">

          <h3>
            Write a Review
          </h3>

          <div className="review-rating-select">

            <span>
              Your Rating:
            </span>

            <div>

              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <button
                    key={star}
                    type="button"
                    className={
                      star <=
                      reviewRating
                        ? "star active"
                        : "star"
                    }
                    onClick={() =>
                      setReviewRating(star)
                    }
                  >
                    ★
                  </button>
                )
              )}

            </div>

          </div>

          <textarea
            value={reviewComment}
            onChange={(event) =>
              setReviewComment(
                event.target.value
              )
            }
            placeholder="Share your experience with this product..."
            rows={4}
          />

          <button
            type="button"
            onClick={submitReview}
            disabled={submittingReview}
          >
            {submittingReview
              ? "Submitting..."
              : "Submit Review"}
          </button>

        </div>

        {/* EXISTING REVIEWS */}

        <div className="reviews-list">

          {reviewLoading ? (
            <p>
              Loading reviews...
            </p>
          ) : reviews.length === 0 ? (
            <div className="no-reviews">

              <h3>
                No reviews yet
              </h3>

              <p>
                Be the first customer
                to review this product.
              </p>

            </div>
          ) : (
            reviews.map(
              (review) => (
                <article
                  className="review-card"
                  key={review._id}
                >

                  <div className="review-header">

                    <div>

                      <strong>
                        {review.user?.name ||
                          "AROVA Customer"}
                      </strong>

                      <div className="review-stars">

                        {[1, 2, 3, 4, 5].map(
                          (star) => (
                            <span
                              key={star}
                            >
                              {star <=
                              review.rating
                                ? "★"
                                : "☆"}
                            </span>
                          )
                        )}

                      </div>

                    </div>

                    <small>
                      {new Date(
                        review.createdAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </small>

                  </div>

                  {review.comment && (
                    <p className="review-comment">
                      {review.comment}
                    </p>
                  )}

                </article>
              )
            )
          )}

        </div>

      </section>

    </main>
  );
};

export default ProductDetails;