import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import "./Profile.css";
const AVATAR_EMOJI = { boy: "👦", girl: "👧", cat: "🐱", dog: "🐶", robot: "🤖" };
const BADGE_LABEL = {
  "halfway-hero": "🏅 Nửa chặng đường",
  champion: "🏆 Nhà vô địch",
};

const renderCurrentLevel = (currentLevel) => {
  if (typeof currentLevel === "number") return currentLevel;
  if (currentLevel && typeof currentLevel === "object") {
    const parts = Object.entries(currentLevel).map(([subject, level]) => {
      const label = subject === "math" ? "Toán" : subject === "english" ? "Anh" : subject;
      return `${label}: ${level}`;
    });
    return parts.join(" · ");
  }
  return "-";
};

const Profile = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (!user) return;
    api
      .get("/game/leaderboard")
      .then(({ data }) => setLeaderboard(data.leaderboard || []))
      .catch(() => {});
  }, [user]);

  if (!user) return null;

  const streakCount = user.streak ?? 0;

  return (
    <section aria-labelledby="profile-title">
      <div className="glass-card profile-card">
        <div style={{ fontSize: "4rem" }} aria-hidden="true">
          {AVATAR_EMOJI[user.avatar] || "🤖"}
        </div>
        <h1 id="profile-title">{user.name}</h1>
        <p style={{ color: "var(--color-text-muted)" }}>{user.email}</p>

        <div className="profile-stats">
          <div className="stat-box">
            <div className="value">{user.totalScore}</div>
            <div>Tổng điểm</div>
          </div>
          <div className="stat-box">
            <div className="value">{renderCurrentLevel(user.currentLevel)}</div>
            <div>Level hiện tại</div>
          </div>
          <div className="stat-box">
            <div className="value">{user.badges?.length || 0}</div>
            <div>Huy hiệu</div>
          </div>
          <div className="stat-box">
            <div className="value">🔥 {streakCount}</div>
            <div>Ngày liên tiếp</div>
          </div>
        </div>

        {user.badges?.length > 0 && (
          <div className="badges-row">
            {user.badges.map((b) => (
              <span key={b} className="badge-chip">
                {BADGE_LABEL[b] || b}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card profile-card" style={{ marginTop: 24 }}>
        <h2>🏆 Bảng xếp hạng</h2>
        {leaderboard.length > 0 ? (
          <ol style={{ textAlign: "left", listStylePosition: "inside" }}>
            {leaderboard.map((u) => {
              const isMe = u._id === user._id || u._id === user.id;
              return (
                <li
                  key={u._id}
                  style={{
                    padding: "8px 12px",
                    borderBottom: "1px solid var(--glass-border)",
                    borderRadius: isMe ? 8 : 0,
                    background: isMe ? "rgba(255, 215, 0, 0.12)" : "transparent",
                    fontWeight: isMe ? 700 : 400,
                  }}
                >
                  {AVATAR_EMOJI[u.avatar] || "🤖"} {u.name} {isMe && "(Bạn)"} — ⭐ {u.totalScore} (Level{" "}
                  {renderCurrentLevel(u.currentLevel)})
                </li>
              );
            })}
          </ol>
        ) : (
          <p>Chưa có dữ liệu bảng xếp hạng.</p>
        )}
      </div>
    </section>
  );
};

export default Profile; 