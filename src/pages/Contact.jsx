import { useState } from "react";
import "./contact.css";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mykrldlo"; // ⭐ thay bằng ID thật của bạn

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="contact-page" aria-labelledby="contact-title">
      <div className="contact-card">
        <h1 id="contact-title">Liên hệ với chúng tôi</h1>
        <p className="contact-subtitle">
          Có góp ý, câu hỏi hay gặp vấn đề khi sử dụng? Gửi tin nhắn cho chúng tôi, đội ngũ sẽ phản hồi sớm nhất có thể.
        </p>

        {status === "success" ? (
          <div className="contact-success">
            <p>✅ Cảm ơn bạn! Tin nhắn đã được gửi thành công.</p>
            <button type="button" className="btn btn-outline" onClick={() => setStatus("idle")}>
              Gửi tin nhắn khác
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Họ và tên</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="ban@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Nội dung</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Nhập nội dung bạn muốn gửi..."
              />
            </div>

            {status === "error" && (
              <p className="contact-error" role="alert">
                ❌ Gửi thất bại, vui lòng thử lại sau.
              </p>
            )}

            <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
              {status === "loading" ? "Đang gửi..." : "Gửi tin nhắn"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Contact;