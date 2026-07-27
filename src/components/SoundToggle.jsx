import { useSound } from "../context/SoundContext.jsx";

const SoundToggle = () => {
  const { enabled, toggleSound } = useSound();

  return (
    <button
      type="button"
      className="sound-toggle"
      onClick={toggleSound}
      aria-pressed={enabled}
      aria-label={enabled ? "Tắt âm thanh" : "Bật âm thanh"}
      title={enabled ? "Tắt âm thanh" : "Bật âm thanh"}
    >
      {enabled ? "🔊" : "🔇"}
    </button>
  );
};

export default SoundToggle;
