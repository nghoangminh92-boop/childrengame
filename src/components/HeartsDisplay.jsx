const HeartsDisplay = ({ lives, maxLives = 3 }) => {
  return (
    <div className="hearts" role="status" aria-label={`${lives} trên ${maxLives} mạng còn lại`}>
      {Array.from({ length: maxLives }, (_, i) => (
        <span key={i} className={i >= lives ? "heart-lost" : ""} aria-hidden="true">
          {i < lives ? "❤️" : "🤍"}
        </span>
      ))}
    </div>
  );
};

export default HeartsDisplay;
