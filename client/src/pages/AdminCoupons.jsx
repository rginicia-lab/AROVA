import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminCoupons = () => {
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrderAmount: "",
    maximumDiscount: "",
    expiresAt: "",
    usageLimit: "",
  });

  // ===============================
  // FETCH COUPONS
  // ===============================

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/v1/coupons");

      if (response.data.success) {
        setCoupons(response.data.coupons || []);
      }
    } catch (err) {
      console.error("Fetch coupons error:", err);

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
          "Unable to load coupons."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // FORM CHANGE
  // ===============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ===============================
  // CREATE COUPON
  // ===============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minimumOrderAmount:
          form.minimumOrderAmount === ""
            ? 0
            : Number(form.minimumOrderAmount),
        maximumDiscount:
          form.maximumDiscount === ""
            ? null
            : Number(form.maximumDiscount),
        expiresAt: form.expiresAt,
        usageLimit:
          form.usageLimit === ""
            ? null
            : Number(form.usageLimit),
      };

      const response = await api.post(
        "/v1/coupons",
        payload
      );

      if (response.data.success) {
        setMessage("Coupon created successfully.");

        setForm({
          code: "",
          description: "",
          discountType: "percentage",
          discountValue: "",
          minimumOrderAmount: "",
          maximumDiscount: "",
          expiresAt: "",
          usageLimit: "",
        });

        fetchCoupons();
      }
    } catch (err) {
      console.error("Create coupon error:", err);

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
          "Unable to create coupon."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // COUPON STATUS
  // ===============================

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) <= new Date();
  };

  const isAvailable = (coupon) => {
    if (!coupon.isActive) {
      return false;
    }

    if (isExpired(coupon.expiresAt)) {
      return false;
    }

    if (
      coupon.usageLimit !== null &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return false;
    }

    return true;
  };

  // ===============================
  // LOADING
  // ===============================

  if (loading) {
    return (
      <main className="admin-coupons-page">
        <h2>Loading coupons...</h2>
      </main>
    );
  }

  // ===============================
  // PAGE
  // ===============================

  return (
    <main className="admin-coupons-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="admin-coupons-header">
        <div>
          <p>AROVA ADMIN</p>
          <h1>Coupon Management</h1>
          <span>
            Create and manage discount coupons.
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin")
          }
        >
          ← Dashboard
        </button>
      </header>

      {/* =========================
          MESSAGES
      ========================= */}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {message && (
        <div className="admin-success">
          {message}
        </div>
      )}

      {/* =========================
          CREATE COUPON
      ========================= */}

      <section className="coupon-form-section">

        <div className="section-heading">
          <p>DISCOUNTS</p>
          <h2>Create Coupon</h2>
        </div>

        <form
          className="coupon-form"
          onSubmit={handleSubmit}
        >

          {/* CODE */}

          <div className="form-group">
            <label htmlFor="code">
              Coupon Code
            </label>

            <input
              id="code"
              name="code"
              type="text"
              placeholder="WELCOME10"
              value={form.code}
              onChange={handleChange}
              required
            />
          </div>

          {/* DESCRIPTION */}

          <div className="form-group">
            <label htmlFor="description">
              Description
            </label>

            <input
              id="description"
              name="description"
              type="text"
              placeholder="10% off your order"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* DISCOUNT TYPE */}

          <div className="form-group">
            <label htmlFor="discountType">
              Discount Type
            </label>

            <select
              id="discountType"
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
            >
              <option value="percentage">
                Percentage
              </option>

              <option value="fixed">
                Fixed Amount
              </option>
            </select>
          </div>

          {/* DISCOUNT VALUE */}

          <div className="form-group">
            <label htmlFor="discountValue">
              Discount Value
            </label>

            <input
              id="discountValue"
              name="discountValue"
              type="number"
              min="0"
              step="1"
              placeholder={
                form.discountType === "percentage"
                  ? "10"
                  : "500"
              }
              value={form.discountValue}
              onChange={handleChange}
              required
            />
          </div>

          {/* MINIMUM ORDER */}

          <div className="form-group">
            <label htmlFor="minimumOrderAmount">
              Minimum Order Amount
            </label>

            <input
              id="minimumOrderAmount"
              name="minimumOrderAmount"
              type="number"
              min="0"
              placeholder="1000"
              value={form.minimumOrderAmount}
              onChange={handleChange}
            />
          </div>

          {/* MAXIMUM DISCOUNT */}

          <div className="form-group">
            <label htmlFor="maximumDiscount">
              Maximum Discount
            </label>

            <input
              id="maximumDiscount"
              name="maximumDiscount"
              type="number"
              min="0"
              placeholder="500"
              value={form.maximumDiscount}
              onChange={handleChange}
            />

            <small>
              Leave empty for no maximum.
            </small>
          </div>

          {/* EXPIRY */}

          <div className="form-group">
            <label htmlFor="expiresAt">
              Expiry Date
            </label>

            <input
              id="expiresAt"
              name="expiresAt"
              type="datetime-local"
              value={form.expiresAt}
              onChange={handleChange}
              required
            />
          </div>

          {/* USAGE LIMIT */}

          <div className="form-group">
            <label htmlFor="usageLimit">
              Usage Limit
            </label>

            <input
              id="usageLimit"
              name="usageLimit"
              type="number"
              min="1"
              placeholder="100"
              value={form.usageLimit}
              onChange={handleChange}
            />

            <small>
              Leave empty for unlimited usage.
            </small>
          </div>

          {/* SUBMIT */}

          <button
            className="create-coupon-button"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Creating..."
              : "Create Coupon"}
          </button>

        </form>
      </section>

      {/* =========================
          COUPON LIST
      ========================= */}

      <section className="coupon-list-section">

        <div className="section-heading">
          <p>ALL COUPONS</p>

          <h2>
            Coupon List
          </h2>

          <span>
            {coupons.length} coupon
            {coupons.length !== 1
              ? "s"
              : ""}
          </span>
        </div>

        {coupons.length === 0 ? (
          <div className="empty-coupons">
            <h3>
              No coupons created yet.
            </h3>

            <p>
              Create your first coupon above.
            </p>
          </div>
        ) : (
          <div className="coupon-table-wrapper">

            <table className="coupon-table">

              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Minimum Order</th>
                  <th>Expiry</th>
                  <th>Usage</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {coupons.map((coupon) => {

                  const available =
                    isAvailable(coupon);

                  return (
                    <tr key={coupon._id}>

                      {/* CODE */}

                      <td>
                        <strong className="coupon-code">
                          {coupon.code}
                        </strong>

                        {coupon.description && (
                          <small>
                            {coupon.description}
                          </small>
                        )}
                      </td>

                      {/* DISCOUNT */}

                      <td>
                        <strong>
                          {coupon.discountType ===
                          "percentage"
                            ? `${coupon.discountValue}%`
                            : `₹${Number(
                                coupon.discountValue
                              ).toLocaleString(
                                "en-IN"
                              )}`}
                        </strong>
                      </td>

                      {/* MINIMUM */}

                      <td>
                        ₹
                        {Number(
                          coupon.minimumOrderAmount || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      {/* EXPIRY */}

                      <td>
                        {new Date(
                          coupon.expiresAt
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>

                      {/* USAGE */}

                      <td>
                        {coupon.usedCount || 0}

                        {" / "}

                        {coupon.usageLimit ??
                          "∞"}
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={
                            available
                              ? "coupon-status active"
                              : "coupon-status inactive"
                          }
                        >
                          {available
                            ? "Active"
                            : "Unavailable"}
                        </span>
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </main>
  );
};

export default AdminCoupons;