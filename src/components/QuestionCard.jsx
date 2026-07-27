import "../pages/Gameplay.css";
const OPTION_LETTERS = ["A", "B", "C", "D"];

const QuestionCard = ({ question, selected, correctAnswer, revealed, flashState, onSelect }) => {
  return (
    <div className={`glass-card question-card${flashState ? ` flash-${flashState}` : ""}`}>
      <h2 className="question-text">{question.question}</h2>
      <div className="options-grid" role="group" aria-label="Các đáp án">
        {question.options.map((opt, idx) => {
          let cls = "option-btn";
          if (revealed) {
            if (opt === correctAnswer) cls += " correct";
            else if (opt === selected) cls += " wrong";
          } else if (opt === selected) {
            cls += " selected";
          }
          return (
            <button
              key={opt + idx}
              type="button"
              className={cls}
              disabled={revealed}
              onClick={() => onSelect(opt)}
              aria-pressed={selected === opt}
            >
              <span className="option-icon">{OPTION_LETTERS[idx]}.</span>
              <span>{opt}</span>
              {revealed && opt === correctAnswer && (
                <span className="check-bounce" aria-hidden="true">
                  ✅
                </span>
              )}
              {revealed && opt === selected && opt !== correctAnswer && (
                <span aria-hidden="true">❌</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
