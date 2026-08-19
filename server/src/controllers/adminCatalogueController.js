const Category = require("../models/Category");
const Product = require("../models/Product");
const PriceWatch = require("../models/PriceWatch");
const Notification = require("../models/Notification");
const slugify = require("../utils/slugify");

const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const category = await Category.create({
      name,
      slug: slugify(name),
      description,
      image,
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;
    const updates = { description, image, isActive };

    if (name) {
      updates.name = name;
      updates.slug = slugify(name);
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      price,
      originalPrice,
      stock,
      lowStockThreshold,
      images,
      tags,
      specifications,
    } = req.body;

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid category",
      });
    }

    const product = await Product.create({
      name,
      slug: slugify(name),
      description,
      category,
      brand,
      price,
      originalPrice,
      stock,
      lowStockThreshold,
      images,
      tags,
      specifications,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "description",
      "category",
      "brand",
      "price",
      "originalPrice",
      "stock",
      "lowStockThreshold",
      "images",
      "tags",
      "specifications",
      "isActive",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.name) {
      updates.slug = slugify(updates.name);
    }

    if (updates.category) {
      const categoryExists = await Category.findById(updates.category);

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid category",
        });
      }
    }

    const previousProduct = await Product.findById(req.params.id);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (
      updates.price !== undefined &&
      previousProduct &&
      product.price < previousProduct.price
    ) {
      const watches = await PriceWatch.find({
        product: product._id,
        isActive: true,
      });

      const eligibleWatches = watches.filter(
        (watch) =>
          watch.targetPrice === null || product.price <= watch.targetPrice
      );

      if (eligibleWatches.length > 0) {
        await Notification.insertMany(
          eligibleWatches.map((watch) => ({
            user: watch.user,
            type: "price_drop",
            title: "Price drop on a watched product",
            message: `${product.name} is now ₹${product.price}.`,
            product: product._id,
          }))
        );

        await PriceWatch.updateMany(
          { _id: { $in: eligibleWatches.map((watch) => watch._id) } },
          { lastNotifiedAt: new Date() }
        );
      }
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product hidden from the catalogue",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCategory,
  updateCategory,
  createProduct,
  updateProduct,
  deleteProduct,
};