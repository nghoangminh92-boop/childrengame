import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import LevelNode from "../components/LevelNode.jsx";
import "./LevelMap.css";

const SUBJECT_LABEL = { math: "Toán học 🧮", english: "Tiếng Anh 🔤" };

const LevelMap = () => {
  const { subject, grade } = useParams();
  const navigate = useNavigate();

  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);

    api
      .get("/game/levels", {
        params: { type: subject, grade },
      })
      .then(({ data }) => {
        if (active) setLevels(data.levels);
      })
      .catch((err) => {
        if (active)
          setError(err.response?.data?.message || "Không tải được danh sách chương");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [subject, grade]);

  const handleSelectLevel = (level, status) => {
    if (status === "locked") return;
    navigate(`/mode/${subject}/${grade}/${level}`);
  };

  return (
    <section>
      <h1 style={{ textAlign: "center" }}>
        {SUBJECT_LABEL[subject]} — Lớp {grade}
      </h1>

      {loading && <p>Đang tải chương học...</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && (
        <div className="level-map">
          <div className="level-path">
            {levels.map((lvl, idx) => (
              <div key={lvl.level} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {idx > 0 && <div className="level-connector" />}

                <LevelNode
                  level={lvl.level}
                  title={lvl.title}
                  icon={lvl.icon}
                  status={lvl.status}
                  onClick={() => handleSelectLevel(lvl.level, lvl.status)}
                />

                {lvl.status !== "locked" && (
                  <p className="chapter-desc">{lvl.description}</p>
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
