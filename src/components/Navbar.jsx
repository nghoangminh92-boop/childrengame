import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { SUBJECTS } from "../data/subjects.js";
import SoundToggle from "./SoundToggle.jsx";
import "./navbar.css";

const AVATAR_EMOJI = {
  boy: "👦",
  girl: "👧",
  cat: "🐱",
  dog: "🐶",
  robot: "🤖",
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="nav-header">
      <nav className="navbar" aria-label="Điều hướng chính">
        <Link to="/" className="navbar__brand">
          <img src="/assets/logo.png" alt="Children Game" className="navbar__brand-logo" />
          <span className="navbar__brand-text">Children Game</span>
        </Link>

        {user && (
          <div className="navbar__subjects">
            {SUBJECTS.map((subject) => (
              <NavLink
                key={subject.key}
                to={subject.path}
                className={({ isActive }) =>
                  "navbar__subject-link" + (isActive ? " is-active" : "")
                }
              >
                <span aria-hidden="true">{subject.emoji}</span> {subject.label}
              </NavLink>
            ))}
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
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                <span className="navbar__avatar-emoji">
                  {AVATAR_EMOJI[user.avatar] || "🤖"}
                </span>
                <span className="navbar__user-name">{user.name}</span>
                <span className="navbar__caret" aria-hidden="true">▾</span>
              </button>

              {menuOpen && (
                <div className="navbar__dropdown" role="menu">
                  <Link
                    to="/profile"
                    className="navbar__dropdown-item"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    👤 Hồ sơ của tôi
                  </Link>
                  <button
                    type="button"
                    className="navbar__dropdown-item navbar__dropdown-item--danger"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__auth-links">
              <Link to="/login" className="navbar__login-link">
                Đăng nhập
              </Link>
            </div>
          )}

          <button
            type="button"
            className={"navbar__hamburger" + (mobileOpen ? " is-open" : "")}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Mở menu điều hướng"
            aria-expanded={mobileOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="navbar__mobile-menu">
          {user &&
            SUBJECTS.map((subject) => (
              <NavLink
                key={subject.key}
                to={subject.path}
                className={({ isActive }) =>
                  "navbar__mobile-link" + (isActive ? " is-active" : "")
                }
                onClick={() => setMobileOpen(false)}
              >
                <span aria-hidden="true">{subject.emoji}</span> {subject.label}
              </NavLink>
            ))}

          {user ? (
            <>
              <NavLink
                to="/profile"
                className="navbar__mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                {AVATAR_EMOJI[user.avatar] || "🤖"} Hồ sơ của tôi
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
              Đăng nhập
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;