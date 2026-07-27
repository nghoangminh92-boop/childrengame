import { useMemo } from "react";

const COLORS = ["#7c5cff", "#22d3c9", "#fbbf24", "#fb7185", "#34d399"];

// Confetti nhẹ, tự dọn dẹp sau khi rớt hết (dùng CSS animation, không cần JS timer nặng)
const Confetti = ({ count = 40 }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.6 + Math.random() * 1.2,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
      })),
    [count]
  );

  return (
    <div aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
