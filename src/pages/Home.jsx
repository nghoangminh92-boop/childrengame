import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios";
import "./Home.css"; // thêm dòng này

const SUBJECTS = [
  {
    to: "/levels/math",
    emoji: "🧮",
    title: "Toán học",
    description: "Chinh phục 10 level từ dễ đến khó",
  },
  {
    to: "/levels/english",
    emoji: "🔤",
    title: "Tiếng Anh",
    description: "Học từ vựng & ngữ pháp cơ bản",
  },
];

// Cấu hình style/icon theo loại thông báo
const NOTICE_TYPES = {
  update: { icon: "🆕", label: "Cập nhật mới", className: "notice--update" },
  warning: { icon: "⚠️", label: "Lưu ý", className: "notice--warning" },
  maintenance: { icon: "🛠️", label: "Bảo trì hệ thống", className: "notice--maintenance" },
  event: { icon: "🎉", label: "Sự kiện", className: "notice--event" },
};

const formatNumber = (num) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${num}`;
};

const formatDate = (isoString) => {
  try {
    return new Date(isoString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

// Component thông báo hệ thống — tách riêng để tái sử dụng ở nơi khác (Dashboard, Header...)
const AnnouncementNotice = ({ notice, onDismiss }) => {
  if (!notice) return null;
  const config = NOTICE_TYPES[notice.type] || NOTICE_TYPES.update;

  return (
    <div className={`notice-banner ${config.className}`} role="alert">
      <div className="notice-icon" aria-hidden="true">
        {config.icon}
      </div>
      <div className="notice-content">
        <div className="notice-header">
          <span className="notice-tag">{config.label}</span>
          {notice.publishedAt && (
            <time className="notice-date" dateTime={notice.publishedAt}>
              {formatDate(notice.publishedAt)}
            </time>
          )}
        </div>
        <p className="notice-title">{notice.title}</p>
        {notice.description && (
          <p className="notice-description">{notice.description}</p>
        )}
      </div>
      {onDismiss && (
        <button
          className="notice-close"
          onClick={onDismiss}
          aria-label="Đóng thông báo"
        >
          ✕
        </button>
      )}
    </div>
  );
};

const SubjectCard = ({ to, emoji, title, description }) => (
  <Link to={to} className="glass-card subject-card" aria-label={`Vào học ${title}`}>
    <div className="emoji" aria-hidden="true">
      {emoji}
    </div>
    <h3>{title}</h3>
    <p>{description}</p>
  </Link>
);

const Home = () => {
  // AuthContext của bạn không có `loading` — user đã sẵn sàng ngay từ lần render đầu
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [notice, setNotice] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  useEffect(() => {
    let ignore = false;

    const fetchHomeData = async () => {
      try {
        // Nếu backend CHƯA có 2 route này, request sẽ lỗi (404) và rơi vào catch bên dưới
        // → phần thông báo/highlights sẽ tự ẩn, không làm vỡ giao diện.
        const [statsRes, noticeRes] = await Promise.all([
          api.get("/stats/summary"),
          api.get("/notices/latest"),
        ]);

        if (!ignore) {
          setStats(statsRes.data);
          setNotice(noticeRes.data || null);
          setDataError(false);
        }
      } catch (err) {
        if (!ignore) setDataError(true);
      } finally {
        if (!ignore) setDataLoading(false);
      }
    };

    fetchHomeData();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (notice?.id) {
      const dismissedId = localStorage.getItem("dismissedNoticeId");
      if (dismissedId === String(notice.id)) setNoticeDismissed(true);
    }
  }, [notice]);

  const handleDismissNotice = () => {
    if (notice?.id) {
      localStorage.setItem("dismissedNoticeId", String(notice.id));
    }
    setNoticeDismissed(true);
  };

  const highlights = stats
    ? [
        { icon: "⭐", label: `${formatNumber(stats.totalStars)} sao đã trao` },
        { icon: "🏅", label: `${formatNumber(stats.totalBadges)} huy hiệu thành tích` },
        { icon: "🎯", label: `${stats.totalLevels} level thử thách` },
        { icon: "👦", label: `${formatNumber(stats.totalStudents)} bé đang học` },
      ]
    : [];

  return (
    <section className="hero" aria-labelledby="home-title">
      {!dataLoading && !noticeDismissed && (
        <AnnouncementNotice notice={notice} onDismiss={handleDismissNotice} />
      )}

      <h1 id="home-title">
        Học mà chơi, chơi mà học! <span aria-hidden="true">🎮✨</span>
      </h1>

      <p className="hero-subtitle">
        <strong>Children Game</strong> giúp bé chinh phục Toán học và Tiếng Anh
        qua từng level thử thách, đầy sao ⭐, huy hiệu 🏅 và niềm vui! Phù hợp
        cho bé từ 6–12 tuổi, học theo lộ trình cá nhân hóa.
      </p>

      {!dataLoading && !dataError && highlights.length > 0 && (
        <ul className="hero-highlights">
          {highlights.map((item) => (
            <li key={item.label} className="highlight-item">
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <div className="subject-grid">
          {SUBJECTS.map((subject) => (
            <SubjectCard key={subject.to} {...subject} />
          ))}
        </div>
      ) : (
        <div className="hero-actions">
          <Link to="/login" className="btn btn-primary">
            Bắt đầu ngay 🚀
          </Link>
        </div>
      )}
    </section>
  );
};

export default Home;