export function PaperPlane({ className = "" }: { className?: string }) {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      className={className}
    >
      <path d="M20 60 L100 20 L80 80 L20 60 Z" fill="#3B82F6" opacity="0.8" />
      <path d="M20 60 L100 20 L60 40 L20 60 Z" fill="#60A5FA" opacity="0.9" />
      <path d="M60 40 L100 20 L80 80 L60 40 Z" fill="#1E40AF" opacity="0.7" />
      {/* Trail */}
      <path
        d="M15 65 Q 10 60 8 58"
        stroke="#3B82F6"
        strokeWidth="2"
        strokeDasharray="4 4"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

export function PaintPalette({ className = "" }: { className?: string }) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      className={className}
    >
      {/* Palette base */}
      <path
        d="M50 10 C25 10 10 25 10 50 C10 75 25 90 50 90 C55 90 60 88 60 85 C60 82 58 80 58 77 C58 74 60 72 63 72 L75 72 C87 72 95 64 95 52 C95 28 75 10 50 10 Z"
        fill="#F59E0B"
        opacity="0.9"
      />
      {/* Paint colors */}
      <circle cx="30" cy="35" r="6" fill="#EF4444" />
      <circle cx="50" cy="28" r="6" fill="#3B82F6" />
      <circle cx="65" cy="38" r="6" fill="#FBBF24" />
      <circle cx="28" cy="55" r="6" fill="#10B981" />
      <circle cx="50" cy="60" r="6" fill="#8B5CF6" />
    </svg>
  );
}

export function BuildingBlocks({ className = "" }: { className?: string }) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      className={className}
    >
      {/* Block 1 - Bottom */}
      <rect
        x="10"
        y="60"
        width="30"
        height="30"
        rx="4"
        fill="#EF4444"
        opacity="0.9"
      />
      <rect
        x="10"
        y="60"
        width="30"
        height="10"
        rx="4"
        fill="#DC2626"
        opacity="0.5"
      />

      {/* Block 2 - Middle */}
      <rect
        x="25"
        y="35"
        width="30"
        height="30"
        rx="4"
        fill="#3B82F6"
        opacity="0.9"
      />
      <rect
        x="25"
        y="35"
        width="30"
        height="10"
        rx="4"
        fill="#2563EB"
        opacity="0.5"
      />

      {/* Block 3 - Top */}
      <rect
        x="40"
        y="10"
        width="30"
        height="30"
        rx="4"
        fill="#FBBF24"
        opacity="0.9"
      />
      <rect
        x="40"
        y="10"
        width="30"
        height="10"
        rx="4"
        fill="#F59E0B"
        opacity="0.5"
      />

      {/* Block 4 - Right */}
      <rect
        x="60"
        y="60"
        width="30"
        height="30"
        rx="4"
        fill="#10B981"
        opacity="0.9"
      />
      <rect
        x="60"
        y="60"
        width="30"
        height="10"
        rx="4"
        fill="#059669"
        opacity="0.5"
      />
    </svg>
  );
}

export function Crayon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      className={className}
    >
      {/* Crayon body */}
      <rect
        x="20"
        y="15"
        width="15"
        height="50"
        rx="2"
        fill="#EF4444"
        transform="rotate(15 27.5 40)"
      />
      {/* Crayon tip */}
      <path
        d="M 32 10 L 27 20 L 37 23 Z"
        fill="#DC2626"
        transform="rotate(15 32 16.5)"
      />
      {/* Paper line */}
      <path
        d="M 48 60 L 60 68"
        stroke="#EF4444"
        strokeWidth="2"
        opacity="0.6"
      />
    </svg>
  );
}

export function Balloon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="60"
      height="90"
      viewBox="0 0 60 90"
      fill="none"
      className={className}
    >
      {/* Balloon */}
      <ellipse cx="30" cy="30" rx="20" ry="25" fill="#F43F5E" opacity="0.9" />
      <ellipse cx="25" cy="22" rx="6" ry="8" fill="#FB7185" opacity="0.6" />
      {/* String */}
      <path
        d="M 30 55 Q 28 70 30 85"
        stroke="#94A3B8"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Knot */}
      <circle cx="30" cy="55" r="2" fill="#FB7185" />
    </svg>
  );
}

export function Kite({ className = "" }: { className?: string }) {
  return (
    <svg
      width="100"
      height="120"
      viewBox="0 0 100 120"
      fill="none"
      className={className}
    >
      {/* Kite body */}
      <path
        d="M 50 10 L 70 40 L 50 70 L 30 40 Z"
        fill="#8B5CF6"
        opacity="0.9"
      />
      <path d="M 50 10 L 70 40 L 50 40 Z" fill="#A78BFA" opacity="0.7" />
      <path d="M 50 40 L 70 40 L 50 70 Z" fill="#7C3AED" opacity="0.8" />
      {/* Cross sticks */}
      <line x1="50" y1="10" x2="50" y2="70" stroke="#1F2937" strokeWidth="2" />
      <line x1="30" y1="40" x2="70" y2="40" stroke="#1F2937" strokeWidth="2" />
      {/* Tail */}
      <circle cx="50" cy="80" r="3" fill="#F43F5E" />
      <circle cx="48" cy="92" r="3" fill="#FBBF24" />
      <circle cx="52" cy="104" r="3" fill="#3B82F6" />
      <path
        d="M 50 70 Q 48 85 48 92 Q 48 98 52 104"
        stroke="#64748B"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

export function TeddyBear({ className = "" }: { className?: string }) {
  return (
    <svg
      width="80"
      height="100"
      viewBox="0 0 80 100"
      fill="none"
      className={className}
    >
      {/* Head */}
      <circle cx="40" cy="35" r="15" fill="#92400E" opacity="0.9" />
      {/* Ears */}
      <circle cx="28" cy="25" r="6" fill="#78350F" opacity="0.9" />
      <circle cx="52" cy="25" r="6" fill="#78350F" opacity="0.9" />
      {/* Face */}
      <circle cx="35" cy="33" r="2" fill="#1F2937" />
      <circle cx="45" cy="33" r="2" fill="#1F2937" />
      {/* Nose */}
      <circle cx="40" cy="38" r="2" fill="#1F2937" />
      {/* Smile */}
      <path
        d="M 35 42 Q 40 44 45 42"
        stroke="#1F2937"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Body */}
      <ellipse cx="40" cy="65" rx="18" ry="22" fill="#A16207" opacity="0.9" />
      {/* Belly */}
      <ellipse cx="40" cy="65" rx="12" ry="15" fill="#D97706" opacity="0.6" />
      {/* Arms */}
      <ellipse cx="22" cy="60" rx="6" ry="12" fill="#92400E" opacity="0.9" />
      <ellipse cx="58" cy="60" rx="6" ry="12" fill="#92400E" opacity="0.9" />
      {/* Legs */}
      <ellipse cx="32" cy="88" rx="6" ry="8" fill="#92400E" opacity="0.9" />
      <ellipse cx="48" cy="88" rx="6" ry="8" fill="#92400E" opacity="0.9" />
    </svg>
  );
}

export function StarDoodle({ className = "" }: { className?: string }) {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      className={className}
    >
      <path
        d="M25 5 L29 19 L43 19 L32 27 L36 41 L25 33 L14 41 L18 27 L7 19 L21 19 Z"
        fill="#FBBF24"
        opacity="0.8"
      />
    </svg>
  );
}

export function Rainbow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="140"
      height="80"
      viewBox="0 0 140 80"
      fill="none"
      className={className}
    >
      <path
        d="M 10 70 Q 70 10 130 70"
        stroke="#EF4444"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M 10 70 Q 70 18 130 70"
        stroke="#F97316"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M 10 70 Q 70 26 130 70"
        stroke="#FBBF24"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M 10 70 Q 70 34 130 70"
        stroke="#10B981"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M 10 70 Q 70 42 130 70"
        stroke="#3B82F6"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M 10 70 Q 70 50 130 70"
        stroke="#8B5CF6"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}
