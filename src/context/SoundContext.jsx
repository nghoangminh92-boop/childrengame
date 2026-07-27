import { createContext, useContext, useMemo, useRef, useState, useEffect } from "react";

const SoundContext = createContext(null);

const SOUND_FILES = {
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  win: "/sounds/win.mp3",
};

export const SoundProvider = ({ children }) => {
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem("edugame_sound_enabled");
    return saved === null ? true : saved === "true";
  });

  const audioRefs = useRef({});

  // Preload all audio elements once
  useEffect(() => {
    Object.entries(SOUND_FILES).forEach(([key, src]) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audioRefs.current[key] = audio;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("edugame_sound_enabled", String(enabled));
  }, [enabled]);

  const play = (key) => {
    if (!enabled) return;
    const audio = audioRefs.current[key];
    if (!audio) return;
    try {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {
      // ignore autoplay errors
    }
  };

  const toggleSound = () => setEnabled((prev) => !prev);

  const value = useMemo(() => ({ enabled, play, toggleSound }), [enabled]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};

export const useSound = () => {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound phải được dùng bên trong SoundProvider");
  return ctx;
};
