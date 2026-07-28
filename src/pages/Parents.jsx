// pages/Parents.jsx
import "../style/InfoPage.css";

const FAQ_ITEMS = [
  {
    q: "Children Game có an toàn cho bé không?",
    a: "Có. Toàn bộ nội dung được kiểm duyệt kỹ, không chứa quảng cáo bên thứ ba hay liên kết ngoài gây xao nhãng cho trẻ.",
  },
  {
    q: "Bé cần thời gian bao lâu mỗi ngày?",
    a: "Chúng tôi khuyến khích 15–20 phút mỗi ngày, đủ để hoàn thành 1–2 level mà không gây quá tải cho bé.",
  },
  {
    q: "Bố mẹ có theo dõi được tiến độ của bé không?",
    a: "Có, thông qua mục Hồ sơ, bố mẹ có thể xem điểm số, huy hiệu, và streak học tập của bé theo thời gian thực.",
  },
  {
    q: "Ứng dụng có thu thập dữ liệu cá nhân của trẻ không?",
    a: "Chúng tôi chỉ lưu thông tin cần thiết để theo dõi tiến độ học tập (tên hiển thị, điểm số), không thu thập dữ liệu nhạy cảm.",
  },
];

const Parents = () => {
  return (
    <div className="info-page">
      <section className="info-hero">
        <h1>Bố Mẹ Cần Biết</h1>
        <p>Những điều bố mẹ nên biết khi đồng hành cùng bé trên Children Game</p>
      </section>

      <section className="info-faq">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>
    </div>
  );
};

export default Parents;