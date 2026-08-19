import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import ProductGrid from "../components/ProductGrid";
import "../styles/shop.css";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/v1/products");

      const data = response.data;

      setProducts(
        Array.isArray(data)
          ? data
          : data.products || data.data || []
      );
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const values = products
      .map((product) =>
        typeof product.category === "object"
          ? product.category?.name
          : product.category
      )
      .filter(Boolean);

    return [...new Set(values)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((product) =>
        product.name?.toLowerCase().includes(query)
      );
    }

    if (category !== "all") {
      result = result.filter((product) => {
        const productCategory =
          typeof product.category === "object"
            ? product.category?.name
            : product.category;

        return productCategory === category;
      });
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "name") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [products, search, category, sort]);

  return (
    <main className="shop-page">
      <section className="shop-header">
        <div>
          <p>AROVA COLLECTION</p>
          <h1>Discover More.</h1>
          <span>Choose Better.</span>
        </div>

        <div className="shop-search">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="shop-controls">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All Categories</option>

          {categories.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="default">Sort By</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name</option>
        </select>
      </section>

      {error && (
        <div className="shop-error">
          {error}
        </div>
      )}

      <section className="shop-results">
        <p>
          {loading
            ? "Loading products..."
            : `${filteredProducts.length} products`}
        </p>

        <ProductGrid
          products={filteredProducts}
          loading={loading}
        />
      </section>
    </main>
  );
};

export default Shop;