interface GrillProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  fill?: string;
}

export default function Grill({ size = 24, className = '', strokeWidth = 2, fill = 'none' }: GrillProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 5v2" />
      <path d="M12 3v4" />
      <path d="M16 5v2" />
      <path d="M4 11h16a8 8 0 0 1-16 0Z" />
      <line x1="2" y1="11" x2="22" y2="11" />
      <line x1="7" y1="18.5" x2="5" y2="22" />
      <line x1="17" y1="18.5" x2="19" y2="22" />
    </svg>
  );
}
