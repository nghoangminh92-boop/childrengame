// outlines.js
// ⭐ Thư viện hình line-art demo cho game tô màu — vẽ bằng SVG code thuần
// (chỉ có nét viền đen, không tô fill) để dùng làm lớp overlay phía trên
// canvas tô màu tự do. Khi cần hình đẹp/chi tiết hơn, chỉ cần thay giá trị
// `svg` bằng nội dung file SVG thật (giữ nguyên fill="none" cho các path
// nét viền để không che mất phần bé tô).
//
// ⭐ Mỗi outline có thêm field `category` để lọc theo tab chủ đề.

export const CATEGORIES = [
  { id: "animal", label: "Động Vật", emoji: "🐾" },
  { id: "vehicle", label: "Phương Tiện", emoji: "🚗" },
  { id: "fruit", label: "Trái Cây", emoji: "🍎" },
  { id: "toy", label: "Đồ Chơi", emoji: "🧸" },
  { id: "nature", label: "Thiên Nhiên", emoji: "🌿" },
];

export const OUTLINES = [
  // ===================== ĐỘNG VẬT =====================
  {
    id: "cat",
    title: "Con Mèo",
    thumbnail: "🐱",
    category: "animal",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="200" cy="190" r="90" />
        <path d="M120 130 L100 60 L165 110 Z" />
        <path d="M280 130 L300 60 L235 110 Z" />
        <circle cx="165" cy="180" r="10" fill="#1a1a1a" stroke="none" />
        <circle cx="235" cy="180" r="10" fill="#1a1a1a" stroke="none" />
        <path d="M190 210 L210 210 L200 222 Z" fill="#1a1a1a" stroke="none" />
        <path d="M200 222 Q185 240 165 228" />
        <path d="M200 222 Q215 240 235 228" />
        <path d="M120 205 L60 195" />
        <path d="M120 220 L58 222" />
        <path d="M280 205 L340 195" />
        <path d="M280 220 L342 222" />
        <path d="M140 260 Q200 220 260 260 L270 340 Q200 380 130 340 Z" />
        <path d="M270 320 Q340 300 330 220" />
      </g>
    `,
  },
  {
    id: "elephant",
    title: "Con Voi",
    thumbnail: "🐘",
    category: "animal",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="110" cy="180" rx="55" ry="70" />
        <ellipse cx="290" cy="180" rx="55" ry="70" />
        <path d="M150 140 Q200 100 250 140 Q290 170 280 230 Q270 300 200 320 Q130 300 120 230 Q110 170 150 140 Z" />
        <circle cx="175" cy="180" r="8" fill="#1a1a1a" stroke="none" />
        <circle cx="225" cy="180" r="8" fill="#1a1a1a" stroke="none" />
        <path d="M200 240 Q195 300 220 330 Q235 345 220 360" />
        <path d="M175 250 Q165 280 175 300" />
        <path d="M225 250 Q235 280 225 300" />
        <path d="M150 320 L145 370" />
        <path d="M185 325 L182 375" />
        <path d="M215 325 L218 375" />
        <path d="M250 320 L255 370" />
      </g>
    `,
  },
  {
    id: "fish",
    title: "Con Cá",
    thumbnail: "🐟",
    category: "animal",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="190" cy="200" rx="120" ry="75" />
        <path d="M300 200 L370 150 L370 250 Z" />
        <path d="M170 130 Q190 90 220 130" />
        <path d="M170 270 Q190 310 220 270" />
        <circle cx="120" cy="180" r="10" fill="#1a1a1a" stroke="none" />
        <path d="M70 205 Q90 218 70 225" />
        <path d="M150 200 Q170 185 190 200 Q170 215 150 200" />
        <path d="M200 200 Q220 185 240 200 Q220 215 200 200" />
      </g>
    `,
  },
  {
    id: "rabbit",
    title: "Con Thỏ",
    thumbnail: "🐰",
    category: "animal",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M155 60 Q145 150 165 200" />
        <path d="M245 60 Q255 150 235 200" />
        <ellipse cx="200" cy="230" rx="85" ry="75" />
        <circle cx="175" cy="215" r="8" fill="#1a1a1a" stroke="none" />
        <circle cx="225" cy="215" r="8" fill="#1a1a1a" stroke="none" />
        <path d="M190 240 L210 240 L200 252 Z" fill="#1a1a1a" stroke="none" />
        <path d="M200 252 Q188 265 172 258" />
        <path d="M200 252 Q212 265 228 258" />
        <ellipse cx="200" cy="330" rx="60" ry="45" />
        <circle cx="330" cy="340" r="22" />
      </g>
    `,
  },
  {
    id: "dog",
    title: "Con Chó",
    thumbnail: "🐶",
    category: "animal",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="200" cy="200" rx="95" ry="85" />
        <path d="M120 150 Q80 130 90 200 Q120 210 135 175" />
        <path d="M280 150 Q320 130 310 200 Q280 210 265 175" />
        <circle cx="170" cy="195" r="9" fill="#1a1a1a" stroke="none" />
        <circle cx="230" cy="195" r="9" fill="#1a1a1a" stroke="none" />
        <ellipse cx="200" cy="230" rx="16" ry="12" fill="#1a1a1a" stroke="none" />
        <path d="M200 242 Q185 258 165 248" />
        <path d="M200 242 Q215 258 235 248" />
        <path d="M150 280 Q200 260 250 280 L255 340 Q200 365 145 340 Z" />
      </g>
    `,
  },

  // ===================== PHƯƠNG TIỆN =====================
  {
    id: "car",
    title: "Ô Tô",
    thumbnail: "🚗",
    category: "vehicle",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M70 260 L90 190 Q110 160 150 160 L250 160 Q290 160 310 190 L330 260" />
        <rect x="55" y="255" width="290" height="55" rx="14" />
        <path d="M130 160 L150 210 L250 210 L270 160" />
        <line x1="190" y1="160" x2="190" y2="210" />
        <circle cx="130" cy="315" r="30" />
        <circle cx="270" cy="315" r="30" />
        <circle cx="130" cy="315" r="8" fill="#1a1a1a" stroke="none" />
        <circle cx="270" cy="315" r="8" fill="#1a1a1a" stroke="none" />
      </g>
    `,
  },
  {
    id: "airplane",
    title: "Máy Bay",
    thumbnail: "✈️",
    category: "vehicle",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="200" cy="200" rx="150" ry="35" />
        <path d="M120 190 L60 130 L90 190 Z" />
        <path d="M120 210 L60 270 L90 210 Z" />
        <path d="M300 185 L350 150 L350 190 L310 205 Z" />
        <path d="M300 215 L350 250 L350 210 L310 195 Z" />
        <circle cx="130" cy="200" r="8" fill="#1a1a1a" stroke="none" />
        <line x1="180" y1="185" x2="180" y2="215" />
        <line x1="220" y1="185" x2="220" y2="215" />
      </g>
    `,
  },
  {
    id: "boat",
    title: "Thuyền Buồm",
    thumbnail: "⛵",
    category: "vehicle",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M90 280 L310 280 L280 330 L120 330 Z" />
        <line x1="200" y1="280" x2="200" y2="100" />
        <path d="M200 110 L280 260 L200 260 Z" />
        <path d="M195 140 L140 260 L195 260 Z" />
        <path d="M60 330 Q200 360 340 330" />
      </g>
    `,
  },
  {
    id: "bicycle",
    title: "Xe Đạp",
    thumbnail: "🚲",
    category: "vehicle",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="110" cy="280" r="65" />
        <circle cx="290" cy="280" r="65" />
        <path d="M110 280 L190 160 L250 160" />
        <path d="M110 280 L230 280 L290 280" />
        <path d="M190 160 L230 280" />
        <path d="M250 160 L275 130 L305 130" />
        <path d="M160 130 L220 130" />
        <line x1="190" y1="130" x2="190" y2="160" />
      </g>
    `,
  },

  // ===================== TRÁI CÂY =====================
  {
    id: "apple",
    title: "Táo",
    thumbnail: "🍎",
    category: "fruit",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M200 160 Q120 150 110 240 Q105 320 170 340 Q200 350 200 340 Q200 350 230 340 Q295 320 290 240 Q280 150 200 160 Z" />
        <path d="M200 160 L200 110" />
        <path d="M200 130 Q240 100 260 130 Q235 155 200 140" />
      </g>
    `,
  },
  {
    id: "banana",
    title: "Chuối",
    thumbnail: "🍌",
    category: "fruit",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M120 100 Q90 200 130 280 Q170 340 260 320" />
        <path d="M150 110 Q125 200 160 270 Q195 325 255 305" />
        <path d="M255 305 Q280 300 290 320" />
        <path d="M115 95 Q125 80 145 90" />
      </g>
    `,
  },
  {
    id: "watermelon",
    title: "Dưa Hấu",
    thumbnail: "🍉",
    category: "fruit",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M70 190 Q200 320 330 190 Q330 300 200 340 Q70 300 70 190 Z" />
        <path d="M100 200 Q200 300 300 200" />
        <circle cx="170" cy="250" r="6" fill="#1a1a1a" stroke="none" />
        <circle cx="200" cy="275" r="6" fill="#1a1a1a" stroke="none" />
        <circle cx="230" cy="250" r="6" fill="#1a1a1a" stroke="none" />
        <circle cx="200" cy="230" r="6" fill="#1a1a1a" stroke="none" />
      </g>
    `,
  },
  {
    id: "strawberry",
    title: "Dâu Tây",
    thumbnail: "🍓",
    category: "fruit",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M200 150 Q120 170 110 250 Q120 330 200 350 Q280 330 290 250 Q280 170 200 150 Z" />
        <path d="M200 150 L170 105 L200 120 L230 105 Z" />
        <circle cx="170" cy="220" r="5" fill="#1a1a1a" stroke="none" />
        <circle cx="210" cy="210" r="5" fill="#1a1a1a" stroke="none" />
        <circle cx="240" cy="235" r="5" fill="#1a1a1a" stroke="none" />
        <circle cx="180" cy="270" r="5" fill="#1a1a1a" stroke="none" />
        <circle cx="220" cy="285" r="5" fill="#1a1a1a" stroke="none" />
      </g>
    `,
  },

  // ===================== ĐỒ CHƠI =====================
  {
    id: "balloon",
    title: "Bóng Bay",
    thumbnail: "🎈",
    category: "toy",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="200" cy="160" rx="80" ry="95" />
        <path d="M190 255 L210 255 L200 275 Z" />
        <path d="M200 275 Q180 320 200 340 Q220 360 200 385" />
      </g>
    `,
  },
  {
    id: "kite",
    title: "Diều",
    thumbnail: "🪁",
    category: "toy",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M200 60 L300 180 L200 300 L100 180 Z" />
        <line x1="200" y1="60" x2="200" y2="300" />
        <line x1="100" y1="180" x2="300" y2="180" />
        <path d="M200 300 Q210 320 195 335 Q220 345 205 360 Q230 370 215 385" />
      </g>
    `,
  },
  {
    id: "teddybear",
    title: "Gấu Bông",
    thumbnail: "🧸",
    category: "toy",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="140" cy="110" r="30" />
        <circle cx="260" cy="110" r="30" />
        <circle cx="200" cy="170" r="80" />
        <circle cx="175" cy="160" r="8" fill="#1a1a1a" stroke="none" />
        <circle cx="225" cy="160" r="8" fill="#1a1a1a" stroke="none" />
        <ellipse cx="200" cy="195" rx="22" ry="16" />
        <ellipse cx="200" cy="300" rx="90" ry="75" />
        <circle cx="130" cy="290" r="28" />
        <circle cx="270" cy="290" r="28" />
      </g>
    `,
  },
  {
    id: "beachball",
    title: "Quả Bóng",
    thumbnail: "🏐",
    category: "toy",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="200" cy="200" r="130" />
        <path d="M200 70 Q130 200 200 330" />
        <path d="M200 70 Q270 200 200 330" />
        <path d="M70 200 L330 200" />
      </g>
    `,
  },

  // ===================== THIÊN NHIÊN =====================
  {
    id: "flower",
    title: "Bông Hoa",
    thumbnail: "🌸",
    category: "nature",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="200" cy="120" rx="45" ry="60" />
        <ellipse cx="200" cy="220" rx="45" ry="60" />
        <ellipse cx="150" cy="170" rx="60" ry="45" />
        <ellipse cx="250" cy="170" rx="60" ry="45" />
        <ellipse cx="163" cy="130" rx="55" ry="42" transform="rotate(-45 163 130)" />
        <ellipse cx="237" cy="130" rx="55" ry="42" transform="rotate(45 237 130)" />
        <ellipse cx="163" cy="210" rx="55" ry="42" transform="rotate(45 163 210)" />
        <ellipse cx="237" cy="210" rx="55" ry="42" transform="rotate(-45 237 210)" />
        <circle cx="200" cy="170" r="35" />
        <path d="M200 260 L200 360" />
        <path d="M200 300 Q150 290 140 330 Q180 340 200 310" />
        <path d="M200 320 Q250 315 260 350 Q220 360 200 335" />
      </g>
    `,
  },
  {
    id: "sun",
    title: "Mặt Trời",
    thumbnail: "☀️",
    category: "nature",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="200" cy="200" r="80" />
        <line x1="200" y1="60" x2="200" y2="30" />
        <line x1="200" y1="340" x2="200" y2="370" />
        <line x1="60" y1="200" x2="30" y2="200" />
        <line x1="340" y1="200" x2="370" y2="200" />
        <line x1="102" y1="102" x2="80" y2="80" />
        <line x1="298" y1="102" x2="320" y2="80" />
        <line x1="102" y1="298" x2="80" y2="320" />
        <line x1="298" y1="298" x2="320" y2="320" />
      </g>
    `,
  },
  {
    id: "tree",
    title: "Cây Xanh",
    thumbnail: "🌳",
    category: "nature",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="150" cy="150" r="65" />
        <circle cx="250" cy="150" r="65" />
        <circle cx="200" cy="110" r="70" />
        <rect x="180" y="200" width="40" height="140" rx="8" />
      </g>
    `,
  },
];

export const getOutlineById = (id) => OUTLINES.find((o) => o.id === id) || OUTLINES[0];