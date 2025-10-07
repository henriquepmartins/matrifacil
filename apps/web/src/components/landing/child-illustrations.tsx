export function ChildReading({ className = "" }: { className?: string }) {
  return (
    <svg
      width="200"
      height="240"
      viewBox="0 0 200 240"
      fill="none"
      className={className}
    >
      {/* Sitting pose */}
      <g>
        {/* Legs */}
        <ellipse
          cx="80"
          cy="190"
          rx="25"
          ry="40"
          fill="#3B82F6"
          opacity="0.9"
        />
        <ellipse
          cx="120"
          cy="190"
          rx="25"
          ry="40"
          fill="#3B82F6"
          opacity="0.9"
        />

        {/* Body */}
        <ellipse
          cx="100"
          cy="130"
          rx="45"
          ry="50"
          fill="#10B981"
          opacity="0.9"
        />

        {/* Book */}
        <rect x="65" y="140" width="70" height="50" rx="4" fill="#FBBF24" />
        <rect
          x="65"
          y="140"
          width="35"
          height="50"
          rx="4"
          fill="#F59E0B"
          opacity="0.7"
        />
        <line
          x1="100"
          y1="145"
          x2="100"
          y2="185"
          stroke="#D97706"
          strokeWidth="2"
        />

        {/* Arms holding book */}
        <ellipse
          cx="55"
          cy="155"
          rx="12"
          ry="30"
          fill="#FCD34D"
          opacity="0.9"
          transform="rotate(-20 55 155)"
        />
        <ellipse
          cx="145"
          cy="155"
          rx="12"
          ry="30"
          fill="#FCD34D"
          opacity="0.9"
          transform="rotate(20 145 155)"
        />

        {/* Head */}
        <circle cx="100" cy="80" r="35" fill="#FFD4A3" />

        {/* Hair */}
        <path
          d="M 65 65 Q 100 40 135 65 L 135 95 Q 100 100 65 95 Z"
          fill="#78350F"
        />
        <circle cx="70" cy="70" r="8" fill="#78350F" />
        <circle cx="130" cy="70" r="8" fill="#78350F" />

        {/* Glasses */}
        <circle
          cx="85"
          cy="80"
          r="10"
          fill="none"
          stroke="#1F2937"
          strokeWidth="2.5"
        />
        <circle
          cx="115"
          cy="80"
          r="10"
          fill="none"
          stroke="#1F2937"
          strokeWidth="2.5"
        />
        <line
          x1="95"
          y1="80"
          x2="105"
          y2="80"
          stroke="#1F2937"
          strokeWidth="2.5"
        />

        {/* Eyes */}
        <circle cx="85" cy="78" r="4" fill="#1F2937" />
        <circle cx="115" cy="78" r="4" fill="#1F2937" />
        <circle cx="86" cy="77" r="2" fill="#fff" />
        <circle cx="116" cy="77" r="2" fill="#fff" />

        {/* Smile */}
        <path
          d="M 85 92 Q 100 98 115 92"
          stroke="#1F2937"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Shoes */}
        <ellipse cx="80" cy="220" rx="18" ry="12" fill="#1F2937" />
        <ellipse cx="120" cy="220" rx="18" ry="12" fill="#1F2937" />
      </g>
    </svg>
  );
}

export function ChildPlaying({ className = "" }: { className?: string }) {
  return (
    <svg
      width="200"
      height="240"
      viewBox="0 0 200 240"
      fill="none"
      className={className}
    >
      {/* Body */}
      <ellipse cx="100" cy="140" rx="40" ry="55" fill="#EC4899" opacity="0.9" />

      {/* Arms - raised happily */}
      <ellipse
        cx="55"
        cy="120"
        rx="15"
        ry="45"
        fill="#FFD4A3"
        transform="rotate(-45 55 120)"
      />
      <ellipse
        cx="145"
        cy="120"
        rx="15"
        ry="45"
        fill="#FFD4A3"
        transform="rotate(45 145 120)"
      />

      {/* Hands with toys */}
      <circle cx="40" cy="90" r="12" fill="#FFD4A3" />
      <circle cx="160" cy="90" r="12" fill="#FFD4A3" />
      {/* Stars in hands */}
      <path
        d="M 40 85 L 42 90 L 47 90 L 43 93 L 45 98 L 40 95 L 35 98 L 37 93 L 33 90 L 38 90 Z"
        fill="#FBBF24"
      />
      <path
        d="M 160 85 L 162 90 L 167 90 L 163 93 L 165 98 L 160 95 L 155 98 L 157 93 L 153 90 L 158 90 Z"
        fill="#3B82F6"
      />

      {/* Head */}
      <circle cx="100" cy="75" r="32" fill="#8B5A3C" />

      {/* Hair - curly */}
      <g fill="#2C1810">
        <circle cx="70" cy="55" r="12" />
        <circle cx="85" cy="48" r="12" />
        <circle cx="100" cy="45" r="12" />
        <circle cx="115" cy="48" r="12" />
        <circle cx="130" cy="55" r="12" />
        <circle cx="75" cy="68" r="10" />
        <circle cx="125" cy="68" r="10" />
      </g>

      {/* Eyes - happy */}
      <path
        d="M 85 70 Q 90 73 95 70"
        stroke="#1F2937"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M 105 70 Q 110 73 115 70"
        stroke="#1F2937"
        strokeWidth="3"
        fill="none"
      />

      {/* Nose */}
      <circle cx="100" cy="78" r="3" fill="#6B4423" />

      {/* Big smile */}
      <path
        d="M 82 87 Q 100 95 118 87"
        stroke="#1F2937"
        strokeWidth="3"
        fill="none"
      />

      {/* Legs */}
      <ellipse cx="80" cy="195" rx="20" ry="50" fill="#7C3AED" opacity="0.9" />
      <ellipse cx="120" cy="195" rx="20" ry="50" fill="#7C3AED" opacity="0.9" />

      {/* Shoes */}
      <ellipse cx="80" cy="225" rx="18" ry="12" fill="#EF4444" />
      <ellipse cx="120" cy="225" rx="18" ry="12" fill="#EF4444" />
    </svg>
  );
}

export function ChildPainting({ className = "" }: { className?: string }) {
  return (
    <svg
      width="200"
      height="240"
      viewBox="0 0 200 240"
      fill="none"
      className={className}
    >
      {/* Easel */}
      <rect x="110" y="120" width="60" height="80" rx="3" fill="#F3F4F6" />
      <line
        x1="140"
        y1="120"
        x2="140"
        y2="220"
        stroke="#78350F"
        strokeWidth="3"
      />
      <line
        x1="120"
        y1="200"
        x2="160"
        y2="200"
        stroke="#78350F"
        strokeWidth="3"
      />

      {/* Painting on easel */}
      <rect x="115" y="125" width="50" height="40" fill="#fff" />
      <circle cx="130" cy="140" r="5" fill="#EF4444" />
      <circle cx="145" cy="135" r="4" fill="#3B82F6" />
      <circle cx="140" cy="150" r="6" fill="#FBBF24" />

      {/* Body */}
      <ellipse cx="70" cy="150" rx="38" ry="50" fill="#F59E0B" opacity="0.9" />

      {/* Arm painting */}
      <ellipse
        cx="95"
        cy="140"
        rx="12"
        ry="38"
        fill="#FCD34D"
        transform="rotate(35 95 140)"
      />

      {/* Paintbrush in hand */}
      <rect
        x="108"
        y="125"
        width="4"
        height="30"
        fill="#78350F"
        transform="rotate(25 110 140)"
      />
      <path
        d="M 115 120 L 110 125 L 115 128 Z"
        fill="#3B82F6"
        transform="rotate(25 112 124)"
      />

      {/* Other arm */}
      <ellipse cx="45" cy="155" rx="12" ry="32" fill="#FCD34D" />

      {/* Head */}
      <circle cx="70" cy="95" r="30" fill="#FFD4A3" />

      {/* Hair with bow */}
      <path
        d="M 40 80 Q 70 55 100 80 L 100 105 Q 70 110 40 105 Z"
        fill="#FCD34D"
      />
      {/* Bow */}
      <g fill="#EC4899">
        <ellipse cx="50" cy="75" rx="8" ry="6" />
        <ellipse cx="62" cy="75" rx="8" ry="6" />
        <circle cx="56" cy="75" r="4" />
      </g>

      {/* Face */}
      <circle cx="62" cy="92" r="4" fill="#1F2937" />
      <circle cx="78" cy="92" r="4" fill="#1F2937" />
      <circle cx="63" cy="91" r="2" fill="#fff" />
      <circle cx="79" cy="91" r="2" fill="#fff" />

      {/* Smile */}
      <path
        d="M 60 102 Q 70 107 80 102"
        stroke="#1F2937"
        strokeWidth="2.5"
        fill="none"
      />

      {/* Paint smudge on face */}
      <circle cx="85" cy="97" r="4" fill="#3B82F6" opacity="0.6" />

      {/* Legs */}
      <ellipse cx="60" cy="200" rx="18" ry="48" fill="#EC4899" opacity="0.9" />
      <ellipse cx="80" cy="200" rx="18" ry="48" fill="#EC4899" opacity="0.9" />

      {/* Shoes */}
      <ellipse cx="60" cy="228" rx="16" ry="10" fill="#8B5CF6" />
      <ellipse cx="80" cy="228" rx="16" ry="10" fill="#8B5CF6" />
    </svg>
  );
}

export function ChildWithBalloon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="200"
      height="280"
      viewBox="0 0 200 280"
      fill="none"
      className={className}
    >
      {/* Balloons */}
      <g>
        <ellipse
          cx="140"
          cy="40"
          rx="20"
          ry="28"
          fill="#EF4444"
          opacity="0.9"
        />
        <path
          d="M 140 68 Q 138 80 140 90"
          stroke="#64748B"
          strokeWidth="1.5"
          fill="none"
        />

        <ellipse
          cx="170"
          cy="30"
          rx="20"
          ry="28"
          fill="#3B82F6"
          opacity="0.9"
        />
        <path
          d="M 170 58 Q 168 70 165 85"
          stroke="#64748B"
          strokeWidth="1.5"
          fill="none"
        />

        <ellipse
          cx="155"
          cy="25"
          rx="20"
          ry="28"
          fill="#FBBF24"
          opacity="0.9"
        />
        <path
          d="M 155 53 Q 153 65 150 85"
          stroke="#64748B"
          strokeWidth="1.5"
          fill="none"
        />
      </g>

      {/* Body */}
      <ellipse cx="90" cy="160" rx="42" ry="52" fill="#14B8A6" opacity="0.9" />

      {/* Arm holding balloons */}
      <ellipse
        cx="130"
        cy="140"
        rx="14"
        ry="42"
        fill="#FFB8A8"
        transform="rotate(-30 130 140)"
      />
      {/* Hand */}
      <circle cx="145" cy="110" r="12" fill="#FFB8A8" />
      {/* Balloon strings in hand */}
      <line
        x1="145"
        y1="110"
        x2="140"
        y2="90"
        stroke="#64748B"
        strokeWidth="2"
      />
      <line
        x1="145"
        y1="110"
        x2="165"
        y2="85"
        stroke="#64748B"
        strokeWidth="2"
      />
      <line
        x1="145"
        y1="110"
        x2="150"
        y2="85"
        stroke="#64748B"
        strokeWidth="2"
      />

      {/* Other arm */}
      <ellipse cx="50" cy="165" rx="14" ry="40" fill="#FFB8A8" />

      {/* Head */}
      <circle cx="90" cy="100" r="32" fill="#FFD4A3" />

      {/* Hair */}
      <path
        d="M 58 85 Q 90 60 122 85 Q 122 108 118 115 L 62 115 Q 58 108 58 85"
        fill="#FF6B6B"
      />

      {/* Eyes */}
      <circle cx="80" cy="98" r="5" fill="#1F2937" />
      <circle cx="100" cy="98" r="5" fill="#1F2937" />
      <circle cx="82" cy="96" r="2" fill="#fff" />
      <circle cx="102" cy="96" r="2" fill="#fff" />

      {/* Happy smile */}
      <path
        d="M 78 108 Q 90 115 102 108"
        stroke="#1F2937"
        strokeWidth="3"
        fill="none"
      />

      {/* Rosy cheeks */}
      <circle cx="72" cy="105" r="5" fill="#F43F5E" opacity="0.4" />
      <circle cx="108" cy="105" r="5" fill="#F43F5E" opacity="0.4" />

      {/* Legs */}
      <ellipse cx="75" cy="212" rx="20" ry="48" fill="#1E40AF" opacity="0.9" />
      <ellipse cx="105" cy="212" rx="20" ry="48" fill="#1E40AF" opacity="0.9" />

      {/* Shoes */}
      <ellipse cx="75" cy="242" rx="18" ry="12" fill="#DC2626" />
      <ellipse cx="105" cy="242" rx="18" ry="12" fill="#DC2626" />
    </svg>
  );
}
