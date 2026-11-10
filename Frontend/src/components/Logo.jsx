import "./Logo.css";

function Logo({ size = "md", className = "" }) {
  const sizeMap = {
    sm: 28,
    md: 36,
    lg: 72,
  };

  const dimension = sizeMap[size] || (typeof size === "number" ? size : 36);
  const idSuffix = `${size}_${Math.floor(dimension)}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={dimension}
      height={dimension}
      fill="none"
      className={`appLogo appLogo--${size} ${className}`.trim()}
      aria-label="SigmaGPT Logo"
      role="img"
    >
      <defs>
        <linearGradient id={`sigmaBg_${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1d24" />
          <stop offset="100%" stopColor="#0c0e12" />
        </linearGradient>

        <linearGradient id={`sigmaBorder_${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10a37f" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.75" />
        </linearGradient>

        <linearGradient id={`sigmaS_${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10a37f" />
          <stop offset="30%" stopColor="#06b6d4" />
          <stop offset="70%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        <linearGradient id={`sigmaHighlight_${idSuffix}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        <filter id={`sigmaGlow_${idSuffix}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Squircle Badge */}
      <rect
        x="3"
        y="3"
        width="94"
        height="94"
        rx="24"
        fill={`url(#sigmaBg_${idSuffix})`}
        stroke={`url(#sigmaBorder_${idSuffix})`}
        strokeWidth="2.5"
      />

      {/* Ambient Center Glow */}
      <circle cx="50" cy="50" r="26" fill="#10a37f" opacity="0.15" />

      {/* Iconic 'S' Ribbon Path */}
      <path
        d="M 69 24 C 69 24 44 24 37 24 C 27 24 20 31 20 40 C 20 49 27 53 38 55 L 62 59 C 73 61 80 65 80 74 C 80 83 73 90 63 90 C 56 90 31 90 31 90"
        stroke={`url(#sigmaS_${idSuffix})`}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#sigmaGlow_${idSuffix})`}
      />

      {/* Internal Sleek Accent Line */}
      <path
        d="M 64 24 C 64 24 44 24 38 24 C 30 24 25 29 25 36"
        stroke={`url(#sigmaHighlight_${idSuffix})`}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Subtle Terminal Energy Nodes */}
      <circle cx="69" cy="24" r="3" fill="#6ee7b7" />
      <circle cx="31" cy="90" r="3" fill="#a78bfa" />
      <circle cx="50" cy="57" r="2.5" fill="#38bdf8" />
    </svg>
  );
}

export default Logo;
