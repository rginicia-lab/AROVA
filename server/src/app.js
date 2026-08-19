const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const catalogueRoutes = require("./routes/catalogueRoutes");
const adminCatalogueRoutes = require("./routes/adminCatalogueRoutes");

const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

const orderRoutes = require("./routes/orderRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");

const reviewRoutes = require("./routes/reviewRoutes");
const adminReviewRoutes = require("./routes/adminReviewRoutes");

const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

const couponRoutes = require("./routes/couponRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const rewardRoutes = require("./routes/rewardRoutes");

const trendingRoutes = require("./routes/trendingRoutes");
const discoveryRoutes = require("./routes/discoveryRoutes");

const priceWatchRoutes = require("./routes/priceWatchRoutes");

const productRoutes = require("./routes/productRoutes");

const app = express();
app.set("trust proxy", 1);
// =====================================================
// SECURITY
// =====================================================

app.use(helmet());

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================================
// LOGGER
// =====================================================

app.use(morgan("dev"));

// =====================================================
// RATE LIMIT
// =====================================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", limiter);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AROVA API is running",
  });
});

// =====================================================
// AUTHENTICATION
// =====================================================

app.use("/api/v1/auth", authRoutes);

// =====================================================
// PRODUCTS / CATALOGUE
// =====================================================

app.use("/api/v1/products", productRoutes);
app.use("/api/v1/catalogue", catalogueRoutes);
app.use("/api/v1/admin/catalogue", adminCatalogueRoutes);

// =====================================================
// CART
// =====================================================

app.use("/api/v1/cart", cartRoutes);

// =====================================================
// WISHLIST
// =====================================================

app.use("/api/v1/wishlist", wishlistRoutes);

// =====================================================
// ORDERS
// =====================================================

app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/admin/orders", adminOrderRoutes);

// =====================================================
// REVIEWS
// =====================================================

app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/admin", adminReviewRoutes);

// =====================================================
// ADMIN ANALYTICS
// =====================================================

app.use("/api/v1/admin/analytics", adminAnalyticsRoutes);

// =====================================================
// INVENTORY
// =====================================================

app.use("/api/v1/admin/inventory", inventoryRoutes);

// =====================================================
// COUPONS
// =====================================================

app.use("/api/v1/coupons", couponRoutes);

// =====================================================
// NOTIFICATIONS
// =====================================================

app.use("/api/v1/notifications", notificationRoutes);

// =====================================================
// REWARDS
// =====================================================

app.use("/api/v1/rewards", rewardRoutes);

// =====================================================
// TRENDING
// =====================================================

app.use("/api/v1/trending", trendingRoutes);

// =====================================================
// DISCOVERY
// =====================================================

app.use("/api/v1/discovery", discoveryRoutes);

// =====================================================
// PRICE WATCH
// =====================================================

app.use("/api/v1/price-watches", priceWatchRoutes);

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;