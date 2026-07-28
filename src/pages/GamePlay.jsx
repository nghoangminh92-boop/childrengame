import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useSound } from "../context/SoundContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import HeartsDisplay from "../components/HeartsDisplay.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import "../styles/GamePlay.css";

const MAX_LIVES = 3;
const POINTS_PER_CORRECT = 10;

const GamePlay = () => {
  // ⭐ PHẢI LẤY ĐỦ subject + grade + level
  const { subject, grade, level } = useParams();
  const navigate = useNavigate();
  const { play } = useSound();
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [flashState, setFlashState] = useState("");
  const [avatarMood, setAvatarMood] = useState("");

  const [explode, setExplode] = useState(false);

  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);

    // ⭐ RESET STATE MỖI LẦN VÀO LEVEL
    setCurrentIdx(0);
    setSelected(null);
    setRevealed(false);
    setFlashState("");
    setAvatarMood("");
    setExplode(false);
    setLives(MAX_LIVES);
    setScore(0);
    setCorrectCount(0);
    setCombo(0);
    setError("");

    // ⭐ API PHẢI GỬI ĐỦ type + grade + level
    api
      .get("/game/questions", {
        params: { type: subject, grade, level },
      })
      .then(({ data }) => {
        if (active) {
          setQuestions(data.questions);
          setChapter(data.chapter);
        }
      })
      .catch((err) => {
        if (active)
          setError(err.response?.data?.message || "Không tải được câu hỏi");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [subject, grade, level]);

  // ⭐ SUBMIT PHẢI GỬI ĐỦ grade
  const finishLevel = useCallback(
    async (finalCorrectCount, finalScore, outOfLives) => {
      try {
        const { data } = await api.post("/game/submit", {
          type: subject,
          grade: Number(grade),
          level: Number(level),
          correctCount: finalCorrectCount,
          totalQuestions: questions.length,
          score: finalScore,
        });

        navigate("/result", {
          state: {
            subject,
            grade: Number(grade),
            level: Number(level),
            chapterTitle: chapter?.title,
            passed: data.passed,
            percent: data.percent,
            score: finalScore,
            correctCount: finalCorrectCount,
            totalQuestions: questions.length,
            outOfLives,
            mode: "quiz",
          },
        });
      } catch (err) {
        setError(err.response?.data?.message || "Không thể lưu kết quả");
      }
    },
    [subject, grade, level, questions.length, navigate, chapter]
  );

  const handleSelect = (option) => {
    if (revealed || !questions[currentIdx]) return;
    const question = questions[currentIdx];
    const isCorrect = option === question.correctAnswer;

    setSelected(option);
    setRevealed(true);

    if (isCorrect) {
      play("correct");
      setFlashState("correct");
      setAvatarMood("jump");

      const newCombo = combo + 1;
      const comboBonus = newCombo >= 3 ? 5 : 0;
      const gained = POINTS_PER_CORRECT + comboBonus;

      setScore((s) => s + gained);
      setCorrectCount((c) => c + 1);
      setCombo(newCombo);
    } else {
      play("wrong");
      setFlashState("wrong");
      setAvatarMood("sad");
      setCombo(0);
    }

    setTimeout(() => {
      setFlashState("");
      setAvatarMood("");

      const newLives = isCorrect ? lives : lives - 1;
      if (!isCorrect) setLives(newLives);

      const isLastQuestion = currentIdx === questions.length - 1;
      const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
      const finalScore = isCorrect
        ? score + POINTS_PER_CORRECT + (combo + 1 >= 3 ? 5 : 0)
        : score;

      // 💥 HIỆU ỨNG NỔ KHI HẾT MẠNG
      if (!isCorrect && newLives <= 0) {
        play("wrong");
        setExplode(true);

        setTimeout(() => {
          finishLevel(finalCorrect, finalScore, true);
        }, 800);

        return;
      }

      if (isLastQuestion) {
        play("win");
        finishLevel(finalCorrect, finalScore, false);
        return;
      }

      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    }, 1100);
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Đang chuẩn bị câu hỏi... 🎲</p>;
  }

  if (error) {
    return (
      <div style={{ textAlign: "center" }}>
        <p className="form-error">{error}</p>
        <Link to={`/map/${subject}/${grade}`} className="btn btn-outline">
          Quay lại bản đồ chương
        </Link>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <p style={{ textAlign: "center" }}>
        Chưa có câu hỏi cho level này.{" "}
        <Link to={`/map/${subject}/${grade}`}>Quay lại bản đồ chương</Link>
      </p>
    );
  }

  const question = questions[currentIdx];

  return (
    <section aria-labelledby="game-title">
      <h1 id="game-title" style={{ textAlign: "center", fontSize: "1.4rem" }}>
        {chapter ? `${chapter.icon} Chương ${level}: ${chapter.title}` : `Level ${level}`}
      </h1>

      <div className="game-header">
        <HeartsDisplay lives={lives} maxLives={MAX_LIVES} />
        <ProgressBar current={currentIdx} total={questions.length} />
        <span className="score-pill">⭐ {score}</span>
      </div>

      {/* --- AVATAR ROBOT + HIỆU ỨNG NỔ --- */}
      <div className="avatar-stage" style={{ position: "relative" }}>
        <img
          src={
            explode
              ? "/assets/robot/sad.png"
              : avatarMood === "jump"
              ? "/assets/robot/jump.png"
              : avatarMood === "sad"
              ? "/assets/robot/sad.png"
              : "/assets/robot/idle.png"
          }
          alt="robot-avatar"
          style={{
            width: "140px",
            height: "140px",
            objectFit: "contain",
            transition: "transform 0.25s ease, filter 0.25s ease",
            transform: explode
              ? "scale(0.6) rotate(12deg)"
              : avatarMood === "jump"
              ? "translateY(-10px) scale(1.05)"
              : avatarMood === "sad"
              ? "translateY(4px) scale(0.95)"
              : "none",
            filter: explode
              ? "brightness(0.4) blur(2px)"
              : avatarMood === "sad"
              ? "grayscale(40%) brightness(0.85)"
              : "none",
          }}
        />

        {explode && (
          <img
            src="/assets/effects/explosion.png"
            alt="explosion"
            style={{
              position: "absolute",
              top: "-20px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "180px",
              height: "180px",
              animation: "explodeAnim 0.8s ease-out forwards",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      <QuestionCard
        question={question}
        selected={selected}
        correctAnswer={question.correctAnswer}
        revealed={revealed}
        flashState={flashState}
        onSelect={handleSelect}
      />

      {combo >= 3 && (
        <p
          style={{
            textAlign: "center",
            marginTop: 12,
            color: "var(--color-warning)",
            fontWeight: 700,
          }}
        >
          🔥 Combo x{combo}!
        </p>
      )}
    </section>
  );
};

export default GamePlay;
