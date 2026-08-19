import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminInventory = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState("");
  const [stockValues, setStockValues] = useState({});

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/v1/admin/inventory/low-stock"
      );

      if (response.data.success) {
        const productList = response.data.products || [];

        setProducts(productList);

        const values = {};

        productList.forEach((product) => {
          values[product._id] = product.stock;
        });

        setStockValues(values);
      }
    } catch (err) {
      console.error("Inventory error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError("You do not have admin permission.");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load inventory."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (productId, value) => {
    setStockValues((current) => ({
      ...current,
      [productId]: value,
    }));
  };

  const updateStock = async (productId) => {
    const stock = Number(stockValues[productId]);

    if (!Number.isInteger(stock) || stock < 0) {
      alert("Stock must be a whole number of 0 or more.");
      return;
    }

    try {
      setUpdating(productId);

      const response = await api.patch(
        `/v1/admin/inventory/${productId}/stock`,
        {
          stock,
        }
      );

      if (response.data.success) {
        alert("Stock updated successfully!");

        // Refresh low-stock products.
        await fetchLowStockProducts();
      }
    } catch (err) {
      console.error("Update stock error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to update stock."
      );
    } finally {
      setUpdating("");
    }
  };

  if (loading) {
    return (
      <main className="admin-page">
        <h2>Loading inventory...</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-page">
        <h2>{error}</h2>

        <button
          onClick={() => navigate("/admin")}
        >
          Back to Dashboard
        </button>
      </main>
    );
  }

  return (
    <main className="admin-page">

      <header className="admin-header">

        <div>
          <p>AROVA ADMIN</p>

          <h1>Inventory Management</h1>

          <span>
            Monitor and update low-stock products.
          </span>
        </div>

        <button
          onClick={() => navigate("/admin")}
        >
          ← Dashboard
        </button>

      </header>

      <section className="admin-stats">

        <div className="admin-stat-card">
          <span>Low Stock Products</span>

          <strong>
            {products.length}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>Out of Stock</span>

          <strong>
            {
              products.filter(
                (product) => product.stock === 0
              ).length
            }
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>Needs Attention</span>

          <strong>
            {
              products.filter(
                (product) =>
                  product.stock <=
                  product.lowStockThreshold
              ).length
            }
          </strong>
        </div>

      </section>

      <section className="admin-section">

        <div className="admin-section-header">

          <div>
            <h2>Low Stock Products</h2>

            <p>
              Products that have reached their
              low-stock threshold.
            </p>
          </div>

          <button
            onClick={fetchLowStockProducts}
          >
            Refresh
          </button>

        </div>

        {products.length === 0 ? (

          <div className="empty-admin-state">
            <h2>Inventory looks good!</h2>

            <p>
              No products are currently below
              their stock threshold.
            </p>
          </div>

        ) : (

          <div className="inventory-list">

            {products.map((product) => (

              <article
                className="inventory-card"
                key={product._id}
              >

                <div className="inventory-product">

                  <div className="inventory-image">

                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                      />
                    ) : (
                      <span>AROVA</span>
                    )}

                  </div>

                  <div className="inventory-info">

                    <h3>
                      {product.name}
                    </h3>

                    <p>
                      ₹
                      {Number(
                        product.price || 0
                      ).toLocaleString("en-IN")}
                    </p>

                    <span>
                      Threshold:{" "}
                      {product.lowStockThreshold ??
                        0}
                    </span>

                  </div>

                </div>

                <div className="inventory-stock">

                  <span
                    className={
                      product.stock === 0
                        ? "stock-danger"
                        : "stock-warning"
                    }
                  >
                    {product.stock === 0
                      ? "Out of Stock"
                      : "Low Stock"}
                  </span>

                  <strong>
                    {product.stock}
                  </strong>

                  <small>
                    units available
                  </small>

                </div>

                <div className="inventory-actions">

                  <label>
                    Update Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      stockValues[
                        product._id
                      ] ?? product.stock
                    }
                    onChange={(event) =>
                      handleStockChange(
                        product._id,
                        event.target.value
                      )
                    }
                  />

                  <button
                    disabled={
                      updating === product._id
                    }
                    onClick={() =>
                      updateStock(
                        product._id
                      )
                    }
                  >
                    {updating === product._id
                      ? "Updating..."
                      : "Update Stock"}
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </main>
  );
};

export default AdminInventory;