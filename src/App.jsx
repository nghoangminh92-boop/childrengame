import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AuroraBackground from "./components/AuroraBackground.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));

const SubjectSelect = lazy(() => import("./pages/SubjectSelect.jsx"));
const GradeSelect = lazy(() => import("./pages/GradeSelect.jsx"));
const LevelMap = lazy(() => import("./pages/LevelMap.jsx"));

const ModeSelect = lazy(() => import("./pages/ModeSelect.jsx"));
const GamePlay = lazy(() => import("./pages/game/quiz/GamePlay.jsx"));
const GamePlayRunner = lazy(() => import("./pages/game/quiz/GamePlayRunner.jsx"));

// ⭐ MỚI: 2 game độc lập, không cần chọn lớp trước
const ColoringGame = lazy(() => import("./pages/game/coloring/ColoringGame.jsx"));
const AnimalGame = lazy(() => import("./pages/game/animal/AnimalGame.jsx"));

const Result = lazy(() => import("./pages/Result.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const NoticesAdmin = lazy(() => import("./pages/admin/NoticesAdmin.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));

// ⭐ MỚI: 2 trang thông tin
const Education = lazy(() => import("./pages/Education.jsx"));
const Parents = lazy(() => import("./pages/Parents.jsx"));

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const PrivateAdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
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
            <Route path="/about" element={<Education />} />
            <Route path="/parents" element={<Parents />} />
            <Route path="/contact" element={<Contact />} />

            {/* FLOW MATH/ENGLISH */}
            <Route
              path="/subjects"
              element={
                <PrivateRoute>
                  <SubjectSelect />
                </PrivateRoute>
              }
            />
            <Route
              path="/grade/:subject"
              element={
                <PrivateRoute>
                  <GradeSelect />
                </PrivateRoute>
              }
            />
            <Route
              path="/map/:subject/:grade"
              element={
                <PrivateRoute>
                  <LevelMap />
                </PrivateRoute>
              }
            />
            <Route
              path="/mode/:subject/:grade/:level"
              element={
                <PrivateRoute>
                  <ModeSelect />
                </PrivateRoute>
              }
            />
            <Route
              path="/play/:subject/:grade/:level"
              element={
                <PrivateRoute>
                  <GamePlay />
                </PrivateRoute>
              }
            />
            <Route
              path="/runner/:subject/:grade/:level"
              element={
                <PrivateRoute>
                  <GamePlayRunner />
                </PrivateRoute>
              }
            />

            {/* GAME ĐỘC LẬP — không qua GradeSelect/LevelMap */}
            <Route
              path="/coloring"
              element={
                <PrivateRoute>
                  <ColoringGame />
                </PrivateRoute>
              }
            />
            <Route
              path="/animal"
              element={
                <PrivateRoute>
                  <AnimalGame />
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

      <Footer />
    </div>
  );
}

export default App;