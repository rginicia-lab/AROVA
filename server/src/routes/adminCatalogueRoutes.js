const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createCategory,
  updateCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/adminCatalogueController");

const router = express.Router();

router.use(protect, authorize("admin"));

router.post("/categories", createCategory);
router.patch("/categories/:id", updateCategory);

router.post("/products", createProduct);
router.patch("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

module.exports = router;