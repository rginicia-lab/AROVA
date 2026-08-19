const express = require("express");
const {
  getCategories,
  getProducts,
  getProductBySlug,
} = require("../controllers/catalogueController");

const router = express.Router();

router.get("/categories", getCategories);
router.get("/products", getProducts);
router.get("/products/:slug", getProductBySlug);

module.exports = router;