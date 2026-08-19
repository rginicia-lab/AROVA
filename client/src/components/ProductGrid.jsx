import ProductCard from "./ProductCard";
import "../styles/product-grid.css";

const ProductGrid = ({ products, loading }) => {
  if (loading) {
    return (
      <div className="product-grid">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div className="product-skeleton" key={item}>
            Loading...
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="empty-products">
        <h2>No products found</h2>
        <p>Try changing your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;