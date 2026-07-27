import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext.jsx";
import "./Login.css";

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSuccess = async (credentialResponse) => {
    setError("");
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate("/");
    } catch {
      setError("Đăng nhập thất bại, vui lòng thử lại.");
    }
  };

  return (
    <section className="login-page" aria-labelledby="login-title">
      {/* Vòng quỹ đạo học tập — bên trái trên desktop, phía trên trên mobile */}
      <div className="login-orbit" aria-hidden="true">
        <div className="orbit-ring">
          <div className="orbit-badge orbit-badge--math">
            <span className="orbit-badge-inner">🧮</span>
          </div>
          <div className="orbit-badge orbit-badge--english">
            <span className="orbit-badge-inner">🔤</span>
          </div>
        </div>

        <div className="login-mascot">
          <img src="/assets/logo.png" alt="" className="login-mascot-logo" />
        </div>

        <span className="login-star login-star--1">✦</span>
        <span className="login-star login-star--2">✦</span>
        <span className="login-star login-star--3">✦</span>
        <span className="login-star login-star--4">✦</span>
      </div>

      {/* Thẻ đăng nhập */}
      <div className="login-card">
        <p className="login-eyebrow">Children Game</p>
        <h1 id="login-title" className="login-title">
          Chào mừng bạn
          <br />
          quay trở lại
        </h1>
        <p className="login-subtitle">
          Đăng nhập bằng tài khoản Google để tiếp tục hành trình học tập của bạn.
        </p>

        <div className="login-google-wrap">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError("Đăng nhập Google thất bại.")}
            text="continue_with"
            shape="pill"
            theme="filled_black"
            size="large"
          />
        </div>

        <p className="login-trust">🔒 An toàn, nhanh chóng — chỉ một chạm</p>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <p className="login-footnote">
          Chưa có tài khoản? Không cần lo — hệ thống sẽ tự tạo hồ sơ mới cho bạn chỉ trong vài giây.
        </p>
      </div>
    </section>
  );
};

export default Login;