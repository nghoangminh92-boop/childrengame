import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AvatarPicker from "../components/AvatarPicker.jsx";

const Register = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    avatar: "robot",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await register(form);

      // Backend trả về message xác thực email
      setSuccess(
        res?.message ||
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass-card auth-wrapper" aria-labelledby="register-title">
      <h1 id="register-title" style={{ textAlign: "center" }}>
        Tạo tài khoản mới 🎉
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <AvatarPicker
          value={form.avatar}
          onChange={(avatar) => setForm((p) => ({ ...p, avatar }))}
        />

        <div className="form-group">
          <label htmlFor="name">Tên của bé</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mật khẩu (tối thiểu 6 ký tự)</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            value={form.password}
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
          <p className="form-success" role="alert" style={{ color: "green" }}>
            {success}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={loading}
        >
          {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 16, color: "var(--color-text-muted)" }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </section>
  );
};

export default Register;
