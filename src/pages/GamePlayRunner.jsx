import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useSound } from "../context/SoundContext.jsx";
import HeartsDisplay from "../components/HeartsDisplay.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import CharacterSprite from "../components/CharacterSprite.jsx";
import "../styles/runner.css";

const MAX_LIVES = 3;
const POINTS_PER_CORRECT = 10;

const GamePlayRunner = () => {
  const { subject, level } = useParams();
  const navigate = useNavigate();
  const { play } = useSound();

  const [questions, setQuestions] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [flashState, setFlashState] = useState("");

  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);

  const [runnerState, setRunnerState] = useState("run");
  const [obstacleKey, setObstacleKey] = useState(0);
  const [explosion, setExplosion] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    // ⭐ RESET TOÀN BỘ STATE MỖI KHI VÀO LẠI LEVEL (kể cả chơi lại cùng level)
    setCurrentIdx(0);
    setSelected(null);
    setRevealed(false);
    setFlashState("");
    setLives(MAX_LIVES);
    setScore(0);
    setCorrectCount(0);
    setCombo(0);
    setRunnerState("run");
    setObstacleKey((k) => k + 1);
    setExplosion(false);
    setShake(false);
    setError("");

    api
      .get("/game/questions", { params: { type: subject, level } })
      .then(({ data }) => {
        if (active) {
          setQuestions(data.questions);
          setChapter(data.chapter);
        }
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Không tải được câu hỏi");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [subject, level]);

  const finishLevel = useCallback(
    async (finalCorrectCount, finalScore, outOfLives) => {
      try {
        const { data } = await api.post("/game/submit", {
          type: subject,
          level: Number(level),
          correctCount: finalCorrectCount,
          totalQuestions: questions.length,
          score: finalScore,
        });

        navigate("/result", {
          state: {
            subject,
            level: Number(level),
            chapterTitle: chapter?.title,
            passed: data.passed,
            percent: data.percent,
            score: finalScore,
            correctCount: finalCorrectCount,
            totalQuestions: questions.length,
            outOfLives,
            mode: "runner", // ⭐ chế độ Runner
          },
        });
      } catch (err) {
        setError(err.response?.data?.message || "Không thể lưu kết quả");
      }
    },
    [subject, level, questions.length, navigate, chapter]
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
      setRunnerState("jump");

      const newCombo = combo + 1;
      const comboBonus = newCombo >= 3 ? 5 : 0;
      const gained = POINTS_PER_CORRECT + comboBonus;

      setScore((s) => s + gained);
      setCorrectCount((c) => c + 1);
      setCombo(newCombo);
    } else {
      play("wrong");
      setFlashState("wrong");
      setRunnerState("hit");
      setCombo(0);

      // ⭐ HIỆU ỨNG NỔ + CAMERA SHAKE
      setExplosion(true);
      setShake(true);

      setTimeout(() => {
        setExplosion(false);
        setShake(false);
      }, 700);
    }

    setTimeout(() => {
      setFlashState("");

      const newLives = isCorrect ? lives : lives - 1;
      if (!isCorrect) setLives(newLives);

      const isLastQuestion = currentIdx === questions.length - 1;
      const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
      const finalScore = isCorrect
        ? score + POINTS_PER_CORRECT + (combo + 1 >= 3 ? 5 : 0)
        : score;

      // ⭐ HẾT MẠNG → chạy animation faint rồi mới chuyển trang kết quả
      if (!isCorrect && newLives <= 0) {
        setRunnerState("faint");
        setTimeout(() => finishLevel(finalCorrect, finalScore, true), 900);
        return;
      }

      setRunnerState("run");

      if (isLastQuestion) {
        finishLevel(finalCorrect, finalScore, false);
        return;
      }

      setObstacleKey((k) => k + 1);
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    }, 900);
  };

  if (loading) return <p style={{ textAlign: "center" }}>Đang chuẩn bị đường chạy... 🏃‍♂️</p>;
  if (error) return <p className="form-error">{error}</p>;

  const question = questions[currentIdx];

  return (
    <section>
      <h1 style={{ textAlign: "center" }}>
        {chapter ? `${chapter.icon} Đường chạy ${level}: ${chapter.title}` : `Runner Level ${level}`}
      </h1>

      <div className="game-header">
        <HeartsDisplay lives={lives} maxLives={MAX_LIVES} />
        <ProgressBar current={currentIdx} total={questions.length} />
        <span className="score-pill">⭐ {score}</span>
      </div>

      <div className={`runner-track ${shake ? "shake" : ""}`}>
        <div className={`runner-robot runner-robot--${runnerState}`}>
          <CharacterSprite state={runnerState} />
        </div>

        <div key={obstacleKey} className="runner-obstacle">
          <div className="electric-anim"></div>
        </div>

        {explosion && <div className="explosion-effect"></div>}
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
        <p style={{ textAlign: "center", marginTop: 12, color: "var(--color-warning)", fontWeight: 700 }}>
          🔥 Combo x{combo}!
        </p>
      )}
    </section>
  );
};

export default GamePlayRunner;