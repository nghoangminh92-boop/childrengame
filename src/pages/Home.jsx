import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios";
import {
  IconMath,
  IconEnglish,
  IconController,
  IconBadge,
  IconStreak,
  IconTrophy,
  IconTarget,
  IconKid,
} from "../components/icons/Icons.jsx";
import "./Home.css";

const SUBJECTS = [
  {
    to: "/levels/math",
    Icon: IconMath,
    title: "Toán học",
    description: "Chinh phục 10 level từ dễ đến khó",
  },
  {
    to: "/levels/english",
    Icon: IconEnglish,
    title: "Tiếng Anh",
    description: "Học từ vựng & ngữ pháp cơ bản",
  },
];

const FEATURES = [
  {
    Icon: IconController,
    title: "Học qua trò chơi",
    description: "3 chế độ chơi: Quiz, Runner, Adventure — mỗi bài học là một thử thách thú vị.",
  },
  {
    Icon: IconBadge,
    title: "Huy hiệu & thành tích",
    description: "Ghi nhận mỗi cột mốc bé đạt được, từ nửa chặng đường đến nhà vô địch.",
  },
  {
    Icon: IconStreak,
    title: "Streak mỗi ngày",
    description: "Duy trì chuỗi ngày học liên tiếp để nhận thưởng và giữ động lực học tập.",
  },
  {
    Icon: IconTrophy,
    title: "Bảng xếp hạng",
    description: "So tài với bạn bè, xem ai là người dẫn đầu bảng điểm mỗi tuần.",
  },
];

const HOW_IT_WORKS = [
  { step: "1", text: "Đăng nhập nhanh bằng tài khoản Google, không cần mật khẩu" },
  { step: "2", text: "Chọn môn học và level phù hợp với trình độ" },
  { step: "3", text: "Trả lời câu hỏi, vượt qua thử thách, thu thập sao và huy hiệu" },
  { step: "4", text: "Theo dõi tiến bộ, mở khóa level mới mỗi ngày" },
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

const SubjectCard = ({ to, Icon, title, description }) => (
  <Link to={to} className="glass-card subject-card" aria-label={`Vào học ${title}`}>
    <Icon size={44} className="subject-icon" />
    <h3>{title}</h3>
    <p>{description}</p>
  </Link>
);

const SubjectPreviewCard = ({ Icon, title, description }) => (
  <div className="glass-card subject-card subject-card--preview">
    <Icon size={44} className="subject-icon" />
    <h3>{title}</h3>
    <p>{description}</p>
    <span className="subject-card-lock">Đăng nhập để bắt đầu</span>
  </div>
);

const FeatureCard = ({ Icon, title, description }) => (
  <div className="glass-card feature-card">
    <Icon size={36} className="feature-icon-svg" />
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
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
    <section className="hero" aria-labelledby="home-title">
      {!dataLoading && !noticeDismissed && (
        <AnnouncementNotice notice={notice} onDismiss={handleDismissNotice} />
      )}

      <h1 id="home-title">Học mà chơi, chơi mà học!</h1>

      <p className="hero-subtitle">
        <strong>Children Game</strong> giúp bé chinh phục Toán học và Tiếng Anh
        qua từng level thử thách, đầy sao và huy hiệu! Phù hợp cho bé từ 6–12
        tuổi, học theo lộ trình cá nhân hóa.
      </p>

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

      {user ? (
        <div className="subject-grid">
          {SUBJECTS.map((subject) => (
            <SubjectCard key={subject.to} {...subject} />
          ))}
        </div>
      ) : (
        <>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary">
              Bắt đầu ngay
            </Link>
          </div>

          {/* ===== Preview môn học ===== */}
          <div className="home-section">
            <h2 className="home-section-title">Khám phá các môn học</h2>
            <div className="subject-grid subject-grid--preview">
              {SUBJECTS.map((subject) => (
                <SubjectPreviewCard key={subject.to} {...subject} />
              ))}
            </div>
          </div>

          {/* ===== Tính năng nổi bật ===== */}
          <div className="home-section">
            <h2 className="home-section-title">Vì sao bé sẽ thích Children Game?</h2>
            <div className="feature-grid">
              {FEATURES.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>

          {/* ===== Cách hoạt động ===== */}
          <div className="home-section">
            <h2 className="home-section-title">Bắt đầu chỉ với 4 bước</h2>
            <div className="steps-grid">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="glass-card step-card">
                  <div className="step-number">{item.step}</div>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ===== CTA cuối trang ===== */}
          <div className="home-cta">
            <h2>Sẵn sàng để bé bắt đầu học rồi đó!</h2>
            <p>Đăng nhập ngay để mở khóa toàn bộ level và bắt đầu hành trình chinh phục kiến thức.</p>
            <Link to="/login" className="btn btn-primary">
              Đăng nhập với Google
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

export default Home;