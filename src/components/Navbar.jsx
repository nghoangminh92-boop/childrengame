// Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SoundToggle from "./SoundToggle.jsx";
import "./navbar.css";

const AVATAR_EMOJI = {
  boy: "👦",
  girl: "👧",
  cat: "🐱",
  dog: "🐶",
  robot: "🤖",
};

const NAV_LINKS = [
  { to: "/", label: "Trang Chủ" },
  { to: "/", label: "Danh Mục Game" },
  { to: "/about", label: "Giáo Dục" },
  { to: "/parents", label: "Bố Mẹ Cần Biết" },
];

const SUBJECTS = [
  { to: "/grade/math", emoji: "➕", label: "Toán" },
  { to: "/grade/english", emoji: "🔤", label: "Anh" },
  { to: "/grade/color", emoji: "🎨", label: "Sáng tạo màu sắc" },
  { to: "/grade/animal", emoji: "🐰", label: "Đố vui động vật" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);

  const menuRef = useRef(null);
  const subjectsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (subjectsRef.current && !subjectsRef.current.contains(e.target)) {
        setSubjectsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="nav-header">
      <nav className="navbar">
        <Link to="/" className="navbar__brand">
          <img src="/assets/logo.png" alt="Children Game" className="navbar__brand-logo" />
          <span className="navbar__brand-text">Children Game</span>
        </Link>

        {/* Link tĩnh — luôn hiện, giống bản mẫu */}
        <ul className="navbar__nav-links">
          {NAV_LINKS.map((link, idx) => (
            <li key={`${link.to}-${idx}`}>
              <NavLink to={link.to} end={link.to === "/"}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Dropdown chọn nhanh môn học — chỉ khi đã đăng nhập */}
        {user && (
          <div className="navbar__subjects-group" ref={subjectsRef}>
            <button
              type="button"
              className="navbar__subjects-btn"
              onClick={() => setSubjectsOpen((v) => !v)}
            >
              📚 Môn học ▾
            </button>

            {subjectsOpen && (
              <div className="navbar__subjects-dropdown">
                {SUBJECTS.map((s) => (
                  <NavLink
                    key={s.to}
                    to={s.to}
                    className="navbar__subjects-item"
                    onClick={() => setSubjectsOpen(false)}
                  >
                    {s.emoji} {s.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="navbar__right">
          <SoundToggle />

          {user ? (
            <div className="navbar__user-menu" ref={menuRef}>
              <button
                type="button"
                className="navbar__avatar-btn"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span className="navbar__avatar-emoji">
                  {AVATAR_EMOJI[user.avatar] || "🤖"}
                </span>
                <span className="navbar__user-name">{user.name}</span>
                <span className="navbar__caret">▾</span>
              </button>

              {menuOpen && (
                <div className="navbar__dropdown">
                  <Link
                    to="/profile"
                    className="navbar__dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    👤 Hồ sơ của tôi
                  </Link>

                  <Link
                    to="/contact"
                    className="navbar__dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    📞 Liên hệ
                  </Link>

                  <button
                    type="button"
                    className="navbar__dropdown-item navbar__dropdown-item--danger"
                    onClick={handleLogout}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar__cta">
              Chơi Ngay!
            </Link>
          )}

          <button
            type="button"
            className={"navbar__hamburger" + (mobileOpen ? " is-open" : "")}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="navbar__mobile-menu">
          {NAV_LINKS.map((link, idx) => (
            <NavLink
              key={`${link.to}-m-${idx}`}
              to={link.to}
              end={link.to === "/"}
              className="navbar__mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}

          {user && (
            <>
              {SUBJECTS.map((s) => (
                <NavLink
                  key={s.to}
                  to={s.to}
                  className="navbar__mobile-link"
                  onClick={() => setMobileOpen(false)}
                >
                  {s.emoji} {s.label}
                </NavLink>
              ))}
            </>
          )}

          {user ? (
            <>
              <NavLink
                to="/profile"
                className="navbar__mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                👤 Hồ sơ của tôi
              </NavLink>

              <button
                type="button"
                className="navbar__mobile-link navbar__mobile-link--danger"
                onClick={handleLogout}
              >
                🚪 Đăng xuất
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="navbar__mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              Chơi Ngay!
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;