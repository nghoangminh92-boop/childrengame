const AVATARS = [
  { id: "boy", emoji: "👦", label: "Bé trai" },
  { id: "girl", emoji: "👧", label: "Bé gái" },
  { id: "cat", emoji: "🐱", label: "Mèo con" },
  { id: "dog", emoji: "🐶", label: "Cún con" },
  { id: "robot", emoji: "🤖", label: "Robot" },
];

const AvatarPicker = ({ value, onChange }) => {
  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
      <legend
        style={{
          marginBottom: 10,
          color: "var(--color-text-muted)",
          fontSize: "0.9rem",
        }}
      >
        Chọn nhân vật của bạn
      </legend>

      <div
        className="avatar-picker"
        role="radiogroup"
        aria-label="Chọn avatar"
      >
        {AVATARS.map((a) => {
          const selected = value === a.id;

          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={a.label}
              className={`avatar-option${selected ? " selected" : ""}`}
              onClick={() => onChange(a.id)}
            >
              {a.emoji}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};

export default AvatarPicker;
