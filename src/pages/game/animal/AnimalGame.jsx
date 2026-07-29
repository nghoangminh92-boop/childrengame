// src/pages/game/animal/AnimalGame.jsx
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import api from "../../../api/axios.js";
import "./AnimalGame.css";

const ANIMAL_GRADE = 1; // ⭐ Cố định — animal không có bước chọn lớp, nhưng backend
                        // (Progress/User.currentLevel) vẫn cần 1 giá trị grade để lưu tiến độ.
const TOTAL_LEVELS = 10;

const LevelPicker = ({ levels, onSelect }) => (
  <div className="animal-level-grid">
    {levels.map((lvl) => (
      <button
        key={lvl.level}
        className={`animal-level-btn animal-level-btn--${lvl.status}`}
        disabled={lvl.status === "locked"}
        onClick={() => onSelect(lvl.level)}
      >
        <span className="animal-level-num">{lvl.level}</span>
        {lvl.status === "completed" && <span className="animal-level-check">✓</span>}
      </button>
    ))}
  </div>
);

const MatchingActivity = ({ pairs, onFinish }) => {
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrongFlash, setWrongFlash] = useState(null);
  const [shuffledNames] = useState(() => [...pairs].sort(() => Math.random() - 0.5));

  const handlePickAnimal = (id) => {
    if (matched.includes(id)) return;
    setSelectedAnimal(id);
  };

  const handlePickName = (id) => {
    if (!selectedAnimal || matched.includes(id)) return;

    if (selectedAnimal === id) {
      const next = [...matched, id];
      setMatched(next);
      setSelectedAnimal(null);
      if (next.length === pairs.length) {
        onFinish({ correctCount: pairs.length, totalQuestions: pairs.length });
      }
    } else {
      setWrongFlash(id);
      setTimeout(() => setWrongFlash(null), 500);
      setSelectedAnimal(null);
    }
  };

  return (
    <div className="animal-matching">
      <p className="animal-instructions">Chạm vào con vật, sau đó chạm vào tên đúng của nó 🐾</p>

      <div className="animal-matching-columns">
        <div className="animal-column">
          {pairs.map((p) => (
            <button
              key={p.name}
              className={
                "animal-card" +
                (matched.includes(p.name) ? " animal-card--matched" : "") +
                (selectedAnimal === p.name ? " animal-card--selected" : "")
              }
              disabled={matched.includes(p.name)}
              onClick={() => handlePickAnimal(p.name)}
            >
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} />
              ) : (
                <span className="animal-emoji">{p.emoji || "🐾"}</span>
              )}
            </button>
          ))}
        </div>

        <div className="animal-column">
          {shuffledNames.map((p) => (
            <button
              key={p.name}
              className={
                "animal-name-card" +
                (matched.includes(p.name) ? " animal-name-card--matched" : "") +
                (wrongFlash === p.name ? " animal-name-card--wrong" : "")
              }
              disabled={matched.includes(p.name)}
              onClick={() => handlePickName(p.name)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const AnimalGame = () => {
  const { user } = useAuth();

  const [levels, setLevels] = useState([]);
  const [levelsLoading, setLevelsLoading] = useState(true);
  const [levelsError, setLevelsError] = useState("");

  const [activeLevel, setActiveLevel] = useState(null);
  const [activity, setActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");

  const [result, setResult] = useState(null);

  const fetchLevels = useCallback(async () => {
    setLevelsLoading(true);
    try {
      const { data } = await api.get("/animal/levels", {
        params: { grade: ANIMAL_GRADE },
      });
      setLevels(data.levels || []);
      setLevelsError("");
    } catch (err) {
      setLevelsError(err.response?.data?.message || "Không tải được danh sách level");
    } finally {
      setLevelsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  const handleSelectLevel = async (level) => {
    setActiveLevel(level);
    setActivityLoading(true);
    setActivityError("");
    setResult(null);
    try {
      const { data } = await api.get("/animal/activity", {
        params: { grade: ANIMAL_GRADE, level },
      });
      setActivity(data);
    } catch (err) {
      setActivityError(err.response?.data?.message || "Không tải được nội dung level này");
    } finally {
      setActivityLoading(false);
    }
  };

  const handleFinishActivity = async ({ correctCount, totalQuestions }) => {
    const percent = Math.round((correctCount / totalQuestions) * 100);
    const score = correctCount * 10;

    try {
      const { data } = await api.post("/animal/submit", {
        grade: ANIMAL_GRADE,
        level: activeLevel,
        correctCount,
        totalQuestions,
        score,
      });
      setResult({ ...data, percent });
      fetchLevels(); // refresh trạng thái khóa/mở
    } catch (err) {
      setActivityError(err.response?.data?.message || "Không gửi được kết quả, thử lại nhé");
    }
  };

  const handleBackToLevels = () => {
    setActiveLevel(null);
    setActivity(null);
    setResult(null);
  };

  return (
    <section className="animal-page" aria-labelledby="animal-title">
      <h1 id="animal-title">Đố Vui Động Vật 🐰</h1>

      {!activeLevel && (
        <>
          {levelsLoading && <p className="animal-status">Đang tải bản đồ level... 🗺️</p>}
          {levelsError && <p className="animal-status animal-status--error">{levelsError}</p>}
          {!levelsLoading && !levelsError && (
            <LevelPicker levels={levels} onSelect={handleSelectLevel} />
          )}
        </>
      )}

      {activeLevel && (
        <div className="animal-play-area">
          <button className="animal-back-btn" onClick={handleBackToLevels}>
            ← Quay lại bản đồ
          </button>

          {activityLoading && <p className="animal-status">Đang chuẩn bị level {activeLevel}... 🐾</p>}
          {activityError && <p className="animal-status animal-status--error">{activityError}</p>}

          {!activityLoading && !activityError && activity && !result && (
            <MatchingActivity pairs={activity.pairs} onFinish={handleFinishActivity} />
          )}

          {result && (
            <div className="animal-result">
              <h2>{result.passed ? "🎉 Chúc mừng, bé đã qua level!" : "💪 Cố gắng thêm nhé!"}</h2>
              <p>Đúng {result.percent}%</p>
              {result.passed && <p>Tổng điểm: {result.totalScore}</p>}
              <button className="btn-primary" onClick={handleBackToLevels}>
                Quay lại bản đồ
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AnimalGame;