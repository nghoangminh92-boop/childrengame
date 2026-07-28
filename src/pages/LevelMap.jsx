import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import LevelNode from "../components/LevelNode.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "./LevelMap.css";

const SUBJECT_LABEL = { math: "Toán học 🧮", english: "Tiếng Anh 🔤" };

const LevelMap = () => {
  const { subject } = useParams();
  const { user } = useAuth(); // ⭐ Lấy grade từ user
  const navigate = useNavigate();

  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);

    api
      .get("/game/levels", {
        params: {
          type: subject,
          grade: user.grade || 1, // ⭐ Gửi grade lên backend
        },
      })
      .then(({ data }) => {
        if (active) setLevels(data.levels);
      })
      .catch((err) => {
        if (active)
          setError(err.response?.data?.message || "Không tải được danh sách chương học");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [subject, user]);

  // ⭐ Điều hướng đúng route mới
  const handleSelectLevel = (level, status) => {
    if (status === "locked") return;
    navigate(`/play/${subject}/${user.grade}/${level}`);
  };

  if (!["math", "english"].includes(subject)) {
    return (
      <p>
        Môn học không hợp lệ. <Link to="/">Quay về trang chủ</Link>
      </p>
    );
  }

  return (
    <section aria-labelledby="levelmap-title">
      <h1 id="levelmap-title" style={{ textAlign: "center" }}>
        {SUBJECT_LABEL[subject]}
      </h1>

      {loading && <p style={{ textAlign: "center" }}>Đang tải chương học... 🗺️</p>}
      {error && (
        <p className="form-error" style={{ textAlign: "center" }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="level-map">
          <div className="level-path">
            {levels.map((lvl, idx) => (
              <div
                key={lvl.level}
                style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                {idx > 0 && <div className="level-connector" aria-hidden="true" />}

                <LevelNode
                  level={lvl.level}
                  title={lvl.title}
                  icon={lvl.icon}
                  status={lvl.status}
                  onClick={() => handleSelectLevel(lvl.level, lvl.status)}
                />

                {lvl.status !== "locked" && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--color-text-muted)",
                      textAlign: "center",
                      maxWidth: 220,
                      margin: "4px 0 0",
                    }}
                  >
                    {lvl.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default LevelMap;
