export default function Logo({ size = 46 }: { size?: number }) {
  const plate = (cy: number, filled: boolean, key: string) => (
    <g key={key}>
      <path
        d={`M28 ${cy - 7} 44 ${cy} 28 ${cy + 7} 12 ${cy}Z`}
        fill={filled ? 'var(--logo-face)' : 'none'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d={`M12 ${cy}v4l16 7 16-7v-4`}
        fill={filled ? 'var(--logo-side)' : 'none'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </g>
  )

  return (
    <svg
      className="logo-mark"
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
    >
      <g className="logo-brackets" stroke="currentColor" strokeWidth="1.4">
        <path d="M3 11V3h8" />
        <path d="M45 3h8v8" />
        <path d="M53 45v8h-8" />
        <path d="M11 53H3v-8" />
      </g>

      {plate(40, false, 'p3')}
      {plate(30, false, 'p2')}
      {plate(20, true, 'p1')}

      <g className="logo-accent" fill="currentColor">
        <circle cx="28" cy="20" r="1.5" />
        <circle cx="36" cy="24" r="1.5" />
        <circle cx="20" cy="24" r="1.5" />
        <circle cx="28" cy="28" r="1.5" />
      </g>
    </svg>
  )
}
