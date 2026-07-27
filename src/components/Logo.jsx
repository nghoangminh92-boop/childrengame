const Logo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradB" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f5a3b3" />
        <stop offset="1" stopColor="#f7c6d0" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="18" fill="url(#logoGradB)" />
    <path
      d="M32 24c-4-3-9-3-13-1v18c4-2 9-2 13 1c4-3 9-3 13-1V23c-4-2-9-2-13 1z"
      fill="#2b1a1e"
    />
    <path d="M32 24v18" stroke="#f7c6d0" strokeWidth="1.5" />
    <path
      d="M46 14l1.4 4.2L52 20l-4.6 1.6L46 26.2l-1.4-4.6L40 20l4.6-1.8L46 14z"
      fill="#fff"
      opacity="0.9"
    />
  </svg>
);

export default Logo;