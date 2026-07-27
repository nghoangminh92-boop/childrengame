import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import AuroraBackground from "./components/AuroraBackground.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const LevelMap = lazy(() => import("./pages/LevelMap.jsx"));
const GamePlay = lazy(() => import("./pages/GamePlay.jsx"));
const GamePlayRunner = lazy(() => import("./pages/GamePlayRunner.jsx"));   // ⭐ CHẾ ĐỘ RUNNER
const ModeSelect = lazy(() => import("./pages/ModeSelect.jsx"));           // ⭐ CHỌN CHẾ ĐỘ

const Result = lazy(() => import("./pages/Result.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const NoticesAdmin = lazy(() => import("./pages/admin/NoticesAdmin.jsx")); // ⭐ ADMIN THÔNG BÁO

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// ⭐ Chỉ cho vào nếu đã đăng nhập VÀ role là admin
const PrivateAdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <div className="app-shell">
      <AuroraBackground />
      <Navbar />
      <main className="app-main">
        <Suspense fallback={<div className="page-loading">Đang tải... ⏳</div>}>
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* PRIVATE */}
            <Route
              path="/levels/:subject"
              element={
                <PrivateRoute>
                  <LevelMap />
                </PrivateRoute>
              }
            />

            {/* ⭐ TRANG CHỌN CHẾ ĐỘ */}
            <Route
              path="/mode/:subject/:level"
              element={
                <PrivateRoute>
                  <ModeSelect />
                </PrivateRoute>
              }
            />

            {/* ⭐ CHẾ ĐỘ QUIZ */}
            <Route
              path="/play/:subject/:level"
              element={
                <PrivateRoute>
                  <GamePlay />
                </PrivateRoute>
              }
            />

            {/* ⭐ CHẾ ĐỘ RUNNER */}
            <Route
              path="/runner/:subject/:level"
              element={
                <PrivateRoute>
                  <GamePlayRunner />
                </PrivateRoute>
              }
            />

            <Route
              path="/result"
              element={
                <PrivateRoute>
                  <Result />
                </PrivateRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* ⭐ ADMIN - QUẢN LÝ THÔNG BÁO */}
            <Route
              path="/admin/notices"
              element={
                <PrivateAdminRoute>
                  <NoticesAdmin />
                </PrivateAdminRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
console.log("CLIENT ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
export default App;