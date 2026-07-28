// pages/Education.jsx
import "../style/InfoPage.css";

const PRINCIPLES = [
  {
    emoji: "🎯",
    title: "Học đi đôi với chơi",
    text: "Mỗi bài học được thiết kế thành thử thách trò chơi, giúp bé tiếp thu tự nhiên mà không áp lực.",
  },
  {
    emoji: "📈",
    title: "Lộ trình cá nhân hóa",
    text: "Level tăng dần độ khó, mở khóa dựa trên tiến độ thực tế của từng bé, không ép theo khuôn mẫu chung.",
  },
  {
    emoji: "🏆",
    title: "Ghi nhận nỗ lực",
    text: "Sao, huy hiệu và streak hàng ngày giúp bé thấy rõ sự tiến bộ của bản thân, tạo động lực học lâu dài.",
  },
  {
    emoji: "👀",
    title: "An toàn & phù hợp lứa tuổi",
    text: "Toàn bộ nội dung được kiểm duyệt kỹ, không quảng cáo gây xao nhãng, phù hợp bé từ 6–12 tuổi.",
  },
];

const Education = () => {
  return (
    <div className="info-page">
      <section className="info-hero">
        <h1>Phương Pháp Giáo Dục</h1>
        <p>Children Game được xây dựng dựa trên nguyên tắc học qua chơi (learning through play)</p>
      </section>

      <section className="info-grid">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="info-card">
            <span className="info-emoji" aria-hidden="true">{p.emoji}</span>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Education;