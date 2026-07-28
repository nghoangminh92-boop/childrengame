// outlines.js
// ⭐ Thư viện hình line-art demo cho game tô màu — vẽ bằng SVG code thuần
// (chỉ có nét viền đen, không tô fill) để dùng làm lớp overlay phía trên
// canvas tô màu tự do. Khi cần hình đẹp/chi tiết hơn, chỉ cần thay giá trị
// `svg` bằng nội dung file SVG thật (giữ nguyên fill="none" cho các path
// nét viền để không che mất phần bé tô).

export const OUTLINES = [
  {
    id: "cat",
    title: "Con Mèo",
    thumbnail: "🐱",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <!-- Đầu -->
        <circle cx="200" cy="190" r="90" />
        <!-- Tai -->
        <path d="M120 130 L100 60 L165 110 Z" />
        <path d="M280 130 L300 60 L235 110 Z" />
        <!-- Mắt -->
        <circle cx="165" cy="180" r="10" fill="#1a1a1a" stroke="none" />
        <circle cx="235" cy="180" r="10" fill="#1a1a1a" stroke="none" />
        <!-- Mũi -->
        <path d="M190 210 L210 210 L200 222 Z" fill="#1a1a1a" stroke="none" />
        <!-- Miệng -->
        <path d="M200 222 Q185 240 165 228" />
        <path d="M200 222 Q215 240 235 228" />
        <!-- Ria -->
        <path d="M120 205 L60 195" />
        <path d="M120 220 L58 222" />
        <path d="M280 205 L340 195" />
        <path d="M280 220 L342 222" />
        <!-- Thân -->
        <path d="M140 260 Q200 220 260 260 L270 340 Q200 380 130 340 Z" />
        <!-- Đuôi -->
        <path d="M270 320 Q340 300 330 220" />
      </g>
    `,
  },
  {
    id: "elephant",
    title: "Con Voi",
    thumbnail: "🐘",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <!-- Tai -->
        <ellipse cx="110" cy="180" rx="55" ry="70" />
        <ellipse cx="290" cy="180" rx="55" ry="70" />
        <!-- Đầu / thân -->
        <path d="M150 140 Q200 100 250 140 Q290 170 280 230 Q270 300 200 320 Q130 300 120 230 Q110 170 150 140 Z" />
        <!-- Mắt -->
        <circle cx="175" cy="180" r="8" fill="#1a1a1a" stroke="none" />
        <circle cx="225" cy="180" r="8" fill="#1a1a1a" stroke="none" />
        <!-- Vòi -->
        <path d="M200 240 Q195 300 220 330 Q235 345 220 360" />
        <!-- Ngà -->
        <path d="M175 250 Q165 280 175 300" />
        <path d="M225 250 Q235 280 225 300" />
        <!-- Chân -->
        <path d="M150 320 L145 370" />
        <path d="M185 325 L182 375" />
        <path d="M215 325 L218 375" />
        <path d="M250 320 L255 370" />
      </g>
    `,
  },
  {
    id: "flower",
    title: "Bông Hoa",
    thumbnail: "🌸",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <!-- Cánh hoa -->
        <ellipse cx="200" cy="120" rx="45" ry="60" />
        <ellipse cx="200" cy="220" rx="45" ry="60" />
        <ellipse cx="150" cy="170" rx="60" ry="45" />
        <ellipse cx="250" cy="170" rx="60" ry="45" />
        <ellipse cx="163" cy="130" rx="55" ry="42" transform="rotate(-45 163 130)" />
        <ellipse cx="237" cy="130" rx="55" ry="42" transform="rotate(45 237 130)" />
        <ellipse cx="163" cy="210" rx="55" ry="42" transform="rotate(45 163 210)" />
        <ellipse cx="237" cy="210" rx="55" ry="42" transform="rotate(-45 237 210)" />
        <!-- Nhụy hoa -->
        <circle cx="200" cy="170" r="35" />
        <!-- Thân -->
        <path d="M200 260 L200 360" />
        <!-- Lá -->
        <path d="M200 300 Q150 290 140 330 Q180 340 200 310" />
        <path d="M200 320 Q250 315 260 350 Q220 360 200 335" />
      </g>
    `,
  },
  {
    id: "fish",
    title: "Con Cá",
    thumbnail: "🐟",
    viewBox: "0 0 400 400",
    svg: `
      <g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <!-- Thân -->
        <ellipse cx="190" cy="200" rx="120" ry="75" />
        <!-- Đuôi -->
        <path d="M300 200 L370 150 L370 250 Z" />
        <!-- Vây trên -->
        <path d="M170 130 Q190 90 220 130" />
        <!-- Vây dưới -->
        <path d="M170 270 Q190 310 220 270" />
        <!-- Mắt -->
        <circle cx="120" cy="180" r="10" fill="#1a1a1a" stroke="none" />
        <!-- Miệng -->
        <path d="M70 205 Q90 218 70 225" />
        <!-- Vảy -->
        <path d="M150 200 Q170 185 190 200 Q170 215 150 200" />
        <path d="M200 200 Q220 185 240 200 Q220 215 200 200" />
      </g>
    `,
  },
];

export const getOutlineById = (id) => OUTLINES.find((o) => o.id === id) || OUTLINES[0];
