import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import Confetti from "../components/Confetti.jsx";

const Result = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state) navigate("/", { replace: true });
  }, [state, navigate]);

  if (!state) return null;

  const {
    subject,
    level,
    chapterTitle,
    passed,
    percent,
    score,
    correctCount,
    totalQuestions,
    outOfLives,
    mode,
  } = state;

  const starCount = percent >= 90 ? 3 : percent >= 70 ? 2 : 1;

  // ⭐ Chọn đúng route "Chơi lại" theo chế độ vừa chơi
  const replayPath =
    mode === "runner"
      ? `/runner/${subject}/${level}`
      : mode === "adventure"
      ? `/adventure/${subject}/${level}`
      : `/play/${subject}/${level}`;

  return (
    <div className="result-overlay">
      {passed && <Confetti />}
      <div className="glass-card result-card" role="dialog" aria-labelledby="result-title">
        {passed ? (
          <>
            <h2 id="result-title">Level Complete 🎉</h2>
            <div className="stars" aria-hidden="true">
              {Array.from({ length: 3 }, (_, i) => (
                <span
                  key={i}
                  className="star-fly"
                  style={{ animationDelay: `${i * 0.15}s`, opacity: i < starCount ? 1 : 0.25 }}
                >
                  ⭐
                </span>
              ))}
            </div>
          </>
        ) : (
          <h2 id="result-title">{outOfLives ? "Hết mạng rồi! 💔" : "Chưa đạt yêu cầu 😥"}</h2>
        )}

        <p>
          Đúng {correctCount}/{totalQuestions} câu ({percent}%)
        </p>
        {chapterTitle && (
          <p style={{ color: "var(--color-text-muted)" }}>Chương {level}: {chapterTitle}</p>
        )}
        <p>Điểm số: ⭐ {score}</p>

        <div
          className="result-progress-track"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="result-progress-fill" style={{ "--target-width": `${percent}%` }} />
        </div>

        {passed && (
          <p className="unlock-badge">
            🔓 Đã mở khóa Level {level + 1}!
          </p>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(replayPath, { replace: true })}
          >
            Chơi lại
          </button>
          <Link to={`/levels/${subject}`} className="btn btn-primary">
            {passed ? "Tiếp tục" : "Bản đồ level"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Result;