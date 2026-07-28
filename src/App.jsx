import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import Navbar from "./components/Navbar.jsx";
import AuroraBackground from "./components/AuroraBackground.jsx";

// ⭐ PAGES
const Home = lazy(() => import("./pages/Home.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));

const SubjectSelect = lazy(() => import("./pages/SubjectSelect.jsx"));   // ⭐ CHỌN MÔN
const GradeSelect = lazy(() => import("./pages/GradeSelect.jsx"));       // ⭐ CHỌN LỚP
const LevelMap = lazy(() => import("./pages/LevelMap.jsx"));             // ⭐ CHƯƠNG (LEVEL)

const ModeSelect = lazy(() => import("./pages/ModeSelect.jsx"));         // ⭐ CHỌN CHẾ ĐỘ
const GamePlay = lazy(() => import("./pages/GamePlay.jsx"));             // ⭐ QUIZ
const GamePlayRunner = lazy(() => import("./pages/GamePlayRunner.jsx")); // ⭐ RUNNER

const Result = lazy(() => import("./pages/Result.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const NoticesAdmin = lazy(() => import("./pages/admin/NoticesAdmin.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

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
            {/* ⭐ PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* ⭐ PRIVATE FLOW MỚI */}
            {/* 1) Chọn môn */}
            <Route
              path="/subjects"
              element={
                <PrivateRoute>
                  <SubjectSelect />
                </PrivateRoute>
              }
            />

            {/* 2) Chọn lớp */}
            <Route
              path="/grade/:subject"
              element={
                <PrivateRoute>
                  <GradeSelect />
                </PrivateRoute>
              }
            />

            {/* 3) Hiện chương (Level Map) */}
            <Route
              path="/map/:subject/:grade"
              element={
                <PrivateRoute>
                  <LevelMap />
                </PrivateRoute>
              }
            />

            {/* 4) Chọn chế độ */}
            <Route
              path="/mode/:subject/:grade/:level"
              element={
                <PrivateRoute>
                  <ModeSelect />
                </PrivateRoute>
              }
            />

            {/* 5) Chế độ Quiz */}
            <Route
              path="/play/:subject/:grade/:level"
              element={
                <PrivateRoute>
                  <GamePlay />
                </PrivateRoute>
              }
            />

            {/* 6) Chế độ Runner */}
            <Route
              path="/runner/:subject/:grade/:level"
              element={
                <PrivateRoute>
                  <GamePlayRunner />
                </PrivateRoute>
              }
            />

            {/* ⭐ RESULT */}
            <Route
              path="/result"
              element={
                <PrivateRoute>
                  <Result />
                </PrivateRoute>
              }
            />

            {/* ⭐ PROFILE */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* ⭐ CONTACT */}
            <Route path="/contact" element={<Contact />} />

            {/* ⭐ ADMIN */}
            <Route
              path="/admin/notices"
              element={
                <PrivateAdminRoute>
                  <NoticesAdmin />
                </PrivateAdminRoute>
              }
            />

            {/* ⭐ FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

        </Suspense>
      </main>
    </div>
  );
}

export default App;
