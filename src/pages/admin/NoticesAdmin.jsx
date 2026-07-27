import { useEffect, useState } from "react";
import api from "../../api/axios";

const TYPE_OPTIONS = [
  { value: "update", label: "🆕 Cập nhật mới" },
  { value: "warning", label: "⚠️ Lưu ý" },
  { value: "maintenance", label: "🛠️ Bảo trì hệ thống" },
  { value: "event", label: "🎉 Sự kiện" },
];

const NoticesAdmin = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "update",
    expiresAt: "",
  });

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notices");
      setNotices(res.data);
    } catch (err) {
      setError("Không tải được danh sách thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Vui lòng nhập tiêu đề thông báo");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await api.post("/notices", {
        title: form.title,
        description: form.description,
        type: form.type,
        expiresAt: form.expiresAt || null,
      });
      setForm({ title: "", description: "", type: "update", expiresAt: "" });
      fetchNotices();
    } catch (err) {
      setError("Đăng thông báo thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (notice) => {
    try {
      await api.patch(`/notices/${notice._id}`, { isActive: !notice.isActive });
      fetchNotices();
    } catch (err) {
      setError("Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa thông báo này?")) return;
    try {
      await api.delete(`/notices/${id}`);
      fetchNotices();
    } catch (err) {
      setError("Xóa thất bại");
    }
  };

  return (
    <section className="admin-notices">
      <h1>Quản lý thông báo</h1>

      <form className="notice-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Tiêu đề</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="VD: Sắp ra mắt chế độ thi đấu 1vs1"
            maxLength={150}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô tả</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Chi tiết ngắn gọn về nội dung cập nhật"
            maxLength={500}
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Loại thông báo</label>
            <select id="type" name="type" value={form.type} onChange={handleChange}>
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="expiresAt">Hết hạn (tùy chọn)</label>
            <input
              id="expiresAt"
              name="expiresAt"
              type="datetime-local"
              value={form.expiresAt}
              onChange={handleChange}
            />
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Đang đăng..." : "Đăng thông báo"}
        </button>
      </form>

      <hr />

      <h2>Danh sách thông báo</h2>

      {loading ? (
        <p>Đang tải...</p>
      ) : notices.length === 0 ? (
        <p>Chưa có thông báo nào.</p>
      ) : (
        <ul className="notice-list">
          {notices.map((n) => (
            <li key={n._id} className={`notice-list-item ${n.isActive ? "" : "is-inactive"}`}>
              <div>
                <strong>{n.title}</strong>
                <p>{n.description}</p>
                <small>
                  {TYPE_OPTIONS.find((t) => t.value === n.type)?.label} ·{" "}
                  {new Date(n.publishedAt).toLocaleString("vi-VN")}
                </small>
              </div>
              <div className="notice-list-actions">
                <button onClick={() => toggleActive(n)}>
                  {n.isActive ? "Ẩn" : "Hiện"}
                </button>
                <button onClick={() => handleDelete(n._id)} className="btn-danger">
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default NoticesAdmin;