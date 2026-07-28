// components/Footer.jsx
import { Link } from "react-router-dom";
import { useState } from "react";
import "./Footer.css";

const FOOTER_LINKS = [
  { to: "/about", label: "Về Chúng Tôi" },
  { to: "/contact", label: "Liên Hệ" },
  { to: "/terms", label: "Điều Khoản" },
];

const Footer = () => {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: điều hướng tới trang kết quả tìm kiếm khi có route thật
  };

  return (
    <footer className="app-footer">
      <ul className="footer-links">
        {FOOTER_LINKS.map((link) => (
          <li key={link.to}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>

      <form className="footer-search" onSubmit={handleSearch} role="search">
        <input
          type="search"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Tìm kiếm"
        />
        <button type="submit" aria-label="Tìm kiếm">🔍</button>
      </form>
    </footer>
  );
};

export default Footer;