import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword !== form.confirmPassword) {
      setError("Xác nhận mật khẩu không khớp");
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(token, form.newPassword);

      setSuccess(
        data.message || "Đặt lại mật khẩu thành công, hãy đăng nhập lại"
      );

      // Điều hướng sau 2 giây
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn, vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="glass-card auth-wrapper"
      aria-labelledby="reset-password-title"
    >
      <h1 id="reset-password-title" style={{ textAlign: "center" }}>
        Đặt lại mật khẩu 🔑
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="newPassword">Mật khẩu mới</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={6}
            value={form.newPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="form-success" role="status">
            {success}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Đặt lại mật khẩu"}
        </button>
      </form>

      <p
        style={{
          textAlign: "center",
          marginTop: 16,
          color: "var(--color-text-muted)",
        }}
      >
        <Link to="/login">← Quay lại đăng nhập</Link>
      </p>
    </section>
  );
};

export default ResetPassword;
