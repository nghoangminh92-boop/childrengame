import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useSound } from "../context/SoundContext";
import { useAuth } from "../context/AuthContext";
import QuestionCard from "../components/QuestionCard";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 500;

const PLAYER_SPEED = 4;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;

export default function AdventurePlay() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const { subject, level } = useParams();
  const { play } = useSound();
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);

  const [player, setPlayer] = useState({
    x: 50,
    y: 400,
    vx: 0,
    vy: 0,
    width: 40,
    height: 60,
    onGround: false,
  });

  const [events, setEvents] = useState([
    { id: "slime1", x: 300, y: 420, type: "enemy", used: false },
    { id: "bridge", x: 600, y: 420, type: "gate", used: false },
    { id: "chest1", x: 900, y: 420, type: "chest", used: false },
    { id: "boss", x: 1500, y: 420, type: "boss", used: false },
  ]);

  useEffect(() => {
    api
      .get("/game/questions", { params: { type: subject, level } })
      .then(({ data }) => setQuestions(data.questions))
      .catch(() => alert("Không tải được câu hỏi"));
  }, [subject, level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let keys = {};

    const handleKeyDown = (e) => (keys[e.key] = true);
    const handleKeyUp = (e) => (keys[e.key] = false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    function gameLoop() {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Player movement
      let newPlayer = { ...player };

      if (keys["ArrowRight"]) newPlayer.vx = PLAYER_SPEED;
      else if (keys["ArrowLeft"]) newPlayer.vx = -PLAYER_SPEED;
      else newPlayer.vx = 0;

      if (keys[" "] && newPlayer.onGround) {
        newPlayer.vy = JUMP_FORCE;
        newPlayer.onGround = false;
      }

      newPlayer.vy += GRAVITY;
      newPlayer.x += newPlayer.vx;
      newPlayer.y += newPlayer.vy;

      if (newPlayer.y >= 400) {
        newPlayer.y = 400;
        newPlayer.vy = 0;
        newPlayer.onGround = true;
      }

      // Draw player
      ctx.fillStyle = "#4ade80";
      ctx.fillRect(newPlayer.x, newPlayer.y, newPlayer.width, newPlayer.height);

      // Draw events
      events.forEach((ev) => {
        if (ev.used) return;

        ctx.fillStyle =
          ev.type === "enemy"
            ? "red"
            : ev.type === "gate"
            ? "yellow"
            : ev.type === "chest"
            ? "orange"
            : "purple";

        ctx.fillRect(ev.x, ev.y, 40, 40);

        // Collision
        if (
          newPlayer.x < ev.x + 40 &&
          newPlayer.x + newPlayer.width > ev.x &&
          newPlayer.y < ev.y + 40 &&
          newPlayer.y + newPlayer.height > ev.y
        ) {
          triggerEvent(ev);
        }
      });

      setPlayer(newPlayer);
      requestAnimationFrame(gameLoop);
    }

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [player, events]);

  function triggerEvent(ev) {
    if (ev.used) return;

    const q = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(q);
    setShowQuestion(true);

    setEvents((prev) =>
      prev.map((e) => (e.id === ev.id ? { ...e, used: true } : e))
    );
  }

  function handleAnswer(option) {
    const isCorrect = option === currentQuestion.correctAnswer;

    if (isCorrect) {
      play("correct");
      alert("Bạn trả lời đúng!");
    } else {
      play("wrong");
      alert("Sai rồi!");
    }

    setShowQuestion(false);

    // Boss event
    if (currentQuestion.type === "boss") {
      if (isCorrect) {
        alert("Bạn đã đánh bại Boss!");
        navigate(`/result`, {
          state: {
            subject,
            level,
            passed: true,
            percent: 100,
            score: 999,
            correctCount: 999,
            totalQuestions: questions.length,
            mode: "adventure", // ⭐ chế độ Adventure
          },
        });
      }
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Adventure Mode – Chương {level}</h1>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          background: "#1e293b",
          border: "3px solid #475569",
          borderRadius: "12px",
        }}
      />

      {showQuestion && (
        <QuestionCard
          question={currentQuestion}
          selected={null}
          correctAnswer={currentQuestion.correctAnswer}
          revealed={false}
          flashState=""
          onSelect={handleAnswer}
        />
      )}
    </div>
  );
}