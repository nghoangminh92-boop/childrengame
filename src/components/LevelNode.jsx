const STATUS_ICON = { locked: "🔒", unlocked: "▶️", completed: "✅" };

const LevelNode = ({ level, title, icon, status, onClick }) => {
  return (
    <div className="level-node-wrap">
      <button
        type="button"
        className={`level-node ${status}`}
        onClick={onClick}
        disabled={status === "locked"}
        aria-label={`Chương ${level}: ${title} - ${
          status === "locked" ? "Đang khóa" : status === "completed" ? "Đã hoàn thành" : "Có thể chơi"
        }`}
      >
        {status === "locked" ? "🔒" : icon || level}
        {status === "completed" && <span className="badge-icon">⭐</span>}
      </button>
      <span className="level-label">
        Chương {level} {STATUS_ICON[status]}
        <br />
        <strong>{title}</strong>
      </span>
    </div>
  );
};

export default LevelNode;
