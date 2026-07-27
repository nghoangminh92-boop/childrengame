const STATE_TO_GIF = {
  idle: "idle",
  run: "run",
  jump: "run",   // tạm dùng run.gif cho lúc trả lời đúng
  hit: "dizzy",  // trả lời sai
  faint: "faint", // hết mạng / game over
};

const CharacterSprite = ({ state = "run", className = "" }) => {
  const gifName = STATE_TO_GIF[state] || "run";
  // key để React remount <img>, ép GIF chạy lại từ đầu mỗi khi đổi trạng thái
  const key = `${state}-${Date.now()}`;

  return (
    <div className={`character-sprite ${className}`}>
      <img key={state} src={`/assets/characters/${gifName}.gif`} alt={state} />
    </div>
  );
};

export default CharacterSprite;