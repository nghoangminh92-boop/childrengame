import { useEffect, useRef } from "react";
import "./AuroraBackground.css"; // ⭐ THÊM DÒNG NÀY
// Nền Aurora Gradient + Mesh blobs + particle nhẹ + mouse parallax
const AuroraBackground = () => {
  const bgRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!bgRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      bgRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: 12 + Math.random() * 10,
  }));

  return (
    <div className="aurora-bg" aria-hidden="true">
      <div ref={bgRef} style={{ position: "absolute", inset: 0, transition: "transform 0.2s ease-out" }}>
        <div className="aurora-blob b1" />
        <div className="aurora-blob b2" />
        <div className="aurora-blob b3" />
        <div className="aurora-blob b4" />
      </div>
      <div className="aurora-particles">
        {particles.map((p) => (
          <span
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              bottom: 0,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>
      <div className="aurora-noise" />
    </div>
  );
};

export default AuroraBackground;
