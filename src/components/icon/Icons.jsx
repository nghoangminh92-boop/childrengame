// Bộ icon SVG tùy chỉnh — thay thế emoji, đồng bộ màu sắc theo theme
export const IconMath = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="12" fill="var(--icon-bg, rgba(245,163,179,0.15))" />
    <path d="M14 16h10M19 11v10" stroke="var(--icon-stroke, currentColor)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M14 32h10" stroke="var(--icon-stroke, currentColor)" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="33" cy="16" r="2" fill="var(--icon-stroke, currentColor)" />
    <path d="M29 32l8-8M29 24l8 8" stroke="var(--icon-stroke, currentColor)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const IconEnglish = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="12" fill="var(--icon-bg, rgba(147,197,253,0.15))" />
    <path
      d="M15 32V16h9M15 24h7"
      stroke="var(--icon-stroke, currentColor)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M27 32c3 0 6-3.5 6-8s-3-8-6-8"
      stroke="var(--icon-stroke, currentColor)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

export const IconController = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="12" fill="var(--icon-bg, rgba(245,163,179,0.15))" />
    <path
      d="M14 20h4v4h4v3h-4v4h-4v-4h-4v-3h4z"
      fill="var(--icon-stroke, currentColor)"
    />
    <circle cx="30" cy="19" r="2.2" fill="var(--icon-stroke, currentColor)" />
    <circle cx="35" cy="24" r="2.2" fill="var(--icon-stroke, currentColor)" />
    <rect
      x="9"
      y="16"
      width="30"
      height="16"
      rx="8"
      stroke="var(--icon-stroke, currentColor)"
      strokeWidth="2.2"
    />
  </svg>
);

export const IconBadge = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="12" fill="var(--icon-bg, rgba(250,204,21,0.15))" />
    <path
      d="M18 26l-3 9 9-4 9 4-3-9"
      stroke="var(--icon-stroke, currentColor)"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <circle cx="24" cy="20" r="8" stroke="var(--icon-stroke, currentColor)" strokeWidth="2.5" />
    <path d="M20 20l3 3 5-6" stroke="var(--icon-stroke, currentColor)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconStreak = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="12" fill="var(--icon-bg, rgba(251,146,60,0.15))" />
    <path
      d="M24 12c1 4-3 5-3 9 0 2 1.5 3.5 3.5 3.5-1-2 0-3.5 1-4.5 0 2 1 3 1 5 0 3-2.5 5-5.5 5-4 0-7-3-7-7 0-6 6-8 10-11z"
      fill="var(--icon-stroke, currentColor)"
    />
  </svg>
);

export const IconTrophy = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="12" fill="var(--icon-bg, rgba(250,204,21,0.15))" />
    <path
      d="M18 14h12v6a6 6 0 01-12 0v-6z"
      stroke="var(--icon-stroke, currentColor)"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <path d="M18 16h-4v3a4 4 0 004 4M30 16h4v3a4 4 0 01-4 4" stroke="var(--icon-stroke, currentColor)" strokeWidth="2" />
    <path d="M24 26v5M20 34h8M20 34l1-3h6l1 3" stroke="var(--icon-stroke, currentColor)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconTarget = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="12" fill="var(--icon-bg, rgba(96,165,250,0.15))" />
    <circle cx="24" cy="24" r="10" stroke="var(--icon-stroke, currentColor)" strokeWidth="2.2" />
    <circle cx="24" cy="24" r="5.5" stroke="var(--icon-stroke, currentColor)" strokeWidth="2.2" />
    <circle cx="24" cy="24" r="1.8" fill="var(--icon-stroke, currentColor)" />
  </svg>
);

export const IconKid = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="12" fill="var(--icon-bg, rgba(74,222,128,0.15))" />
    <circle cx="24" cy="18" r="6" stroke="var(--icon-stroke, currentColor)" strokeWidth="2.2" />
    <path
      d="M13 35c0-6 5-9 11-9s11 3 11 9"
      stroke="var(--icon-stroke, currentColor)"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);