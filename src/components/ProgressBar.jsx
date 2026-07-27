const ProgressBar = ({ current, total }) => {
  const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div
      className="progress-bar-track"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Tiến độ câu hỏi ${current}/${total}`}
    >
      <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
    </div>
  );
};

export default ProgressBar;
