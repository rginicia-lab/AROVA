import { Link } from "react-router-dom";
import "../styles/product-card.css";

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} className="product-image">
        <img
          src={product.images?.[0] || product.image}
          alt={product.name}
        />
      </Link>

      <div className="product-info">
        <p className="product-category">
          {product.category?.name || product.category || "Product"}
        </p>

        <h3>{product.name}</h3>

        {product.rating !== undefined && (
          <div className="product-rating">
            ⭐ {Number(product.rating).toFixed(1)}
          </div>
        )}

        <div className="product-price">
          ₹{Number(product.price).toLocaleString("en-IN")}
        </div>

        {product.stock !== undefined && (
          <p className={product.stock > 0 ? "in-stock" : "out-stock"}>
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;