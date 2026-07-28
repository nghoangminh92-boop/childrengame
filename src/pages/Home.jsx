// Home.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios";
import { IconTrophy, IconBadge, IconTarget, IconKid } from "../components/icon/Icons.jsx";
import "./Home.css";

const CATEGORIES = [
  {
    to: "/grade/math",
    emoji: "🍎",
    badgeClass: "badge-red",
    title: "Học Số Học",
    description: "Rèn luyện phép cộng, trừ, nhân, chia qua từng level.",
  },
  {
    to: "/grade/english",
    emoji: "🔤",
    badgeClass: "badge-blue",
    title: "Học Từ Vựng",
    description: "Mở rộng vốn từ tiếng Anh cùng hình ảnh sinh động.",
  },
  {
    to: "/grade/color",
    emoji: "🎨",
    badgeClass: "badge-yellow",
    title: "Sáng Tạo Màu Sắc",
    description: "Tự do tô màu, sáng tạo theo trí tưởng tượng của bé.",
  },
  {
    to: "/grade/animal",
    emoji: "🐰",
    badgeClass: "badge-green",
    title: "Đố Vui Động Vật",
    description: "Ghép hình, nhận diện âm thanh các loài động vật.",
  },
];

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

const CategoryCard = ({ to, emoji, badgeClass, title, description, locked }) => (
  <Link to={to} className="category-card" aria-label={`Vào chơi ${title}`}>
    <span className={`category-badge ${badgeClass}`} aria-hidden="true">
      {emoji}
    </span>
    <h3>{title}</h3>
    <p>{description}</p>
    {locked && <span className="category-lock">🔒 Đăng nhập để bắt đầu</span>}
  </Link>
);

const Home = () => {
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
        { Icon: IconTrophy, label: `${formatNumber(stats.totalStars)} sao đã trao` },
        { Icon: IconBadge, label: `${formatNumber(stats.totalBadges)} huy hiệu thành tích` },
        { Icon: IconTarget, label: `${stats.totalLevels} level thử thách` },
        { Icon: IconKid, label: `${formatNumber(stats.totalStudents)} bé đang học` },
      ]
    : [];

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          {!dataLoading && !noticeDismissed && (
            <AnnouncementNotice notice={notice} onDismiss={handleDismissNotice} />
          )}

          <h1 id="home-title">Khám Phá &amp; Học Vui Mỗi Ngày</h1>
          <p className="hero-subtitle">Web Game Giáo Dục Dành Riêng Cho Bé</p>

          {!dataLoading && !dataError && highlights.length > 0 && (
            <ul className="hero-highlights">
              {highlights.map((item) => (
                <li key={item.label} className="highlight-item">
                  <item.Icon size={20} />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          )}

          {!user && (
            <Link to="/login" className="btn-primary btn-large">
              Chơi Ngay!
            </Link>
          )}
        </div>
      </section>

      <section className="category-grid" aria-label="Danh sách môn học">
        {CATEGORIES.map((cat) => (
          <CategoryCard key={cat.to} {...cat} locked={!user} />
        ))}
      </section>
    </div>
  );
};

export default Home;