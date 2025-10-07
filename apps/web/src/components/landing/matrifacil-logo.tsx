export function MatrifacilLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      width="200"
      height="60"
      viewBox="0 0 200 60"
      fill="none"
      className={className}
    >
      {/* Lightning bolt background */}
      <g>
        {/* Main lightning shape */}
        <path
          d="M 140 8 L 100 25 L 120 30 L 95 50 L 140 32 L 120 27 Z"
          fill="#FCD34D"
          stroke="#1F2937"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Stars */}
        <g fill="#1F2937">
          {/* Top right star */}
          <path d="M 155 12 L 157 17 L 162 17 L 158 20 L 160 25 L 155 22 L 150 25 L 152 20 L 148 17 L 153 17 Z" />

          {/* Bottom left star */}
          <path d="M 90 45 L 92 48 L 95 48 L 92 50 L 93 53 L 90 51 L 87 53 L 88 50 L 85 48 L 88 48 Z" />

          {/* Middle star */}
          <path d="M 108 38 L 110 41 L 113 41 L 110 43 L 111 46 L 108 44 L 105 46 L 106 43 L 103 41 L 106 41 Z" />
        </g>
      </g>

      {/* MATRIFACIL text */}
      <text
        x="10"
        y="42"
        fontFamily="Arial, sans-serif"
        fontSize="32"
        fontWeight="900"
        fill="#F9A8D4"
        stroke="#1F2937"
        strokeWidth="3"
        paintOrder="stroke"
      >
        MATRIFACIL
      </text>
    </svg>
  );
}

export function MatrifacilLogoCompact({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      width="160"
      height="50"
      viewBox="0 0 160 50"
      fill="none"
      className={className}
    >
      {/* Lightning bolt */}
      <g transform="translate(-20, -5)">
        <path
          d="M 140 8 L 100 25 L 120 30 L 95 50 L 140 32 L 120 27 Z"
          fill="#FCD34D"
          stroke="#1F2937"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Stars */}
        <g fill="#1F2937">
          <path d="M 155 12 L 157 17 L 162 17 L 158 20 L 160 25 L 155 22 L 150 25 L 152 20 L 148 17 L 153 17 Z" />
          <path d="M 90 45 L 92 48 L 95 48 L 92 50 L 93 53 L 90 51 L 87 53 L 88 50 L 85 48 L 88 48 Z" />
        </g>
      </g>

      {/* MATRIFACIL text - smaller */}
      <text
        x="5"
        y="35"
        fontFamily="Arial, sans-serif"
        fontSize="26"
        fontWeight="900"
        fill="#F9A8D4"
        stroke="#1F2937"
        strokeWidth="2.5"
        paintOrder="stroke"
      >
        MATRIFACIL
      </text>
    </svg>
  );
}
