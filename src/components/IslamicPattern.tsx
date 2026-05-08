export default function IslamicPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.04]"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="islamic-pattern"
          x="0"
          y="0"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M40 0 L80 40 L40 80 L0 40 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <circle cx="40" cy="40" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="40" cy="0" r="3" fill="currentColor" />
          <circle cx="80" cy="40" r="3" fill="currentColor" />
          <circle cx="40" cy="80" r="3" fill="currentColor" />
          <circle cx="0" cy="40" r="3" fill="currentColor" />
          <path
            d="M40 8 L72 40 L40 72 L8 40 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.4"
          />
          <path
            d="M40 16 L64 40 L40 64 L16 40 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.3"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
    </svg>
  );
}

export function IslamicCorner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <path
        d="M0 0 L200 0 L200 200 L0 200 Z"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
        opacity="0.3"
      />
      <path
        d="M20 20 L180 20 L180 180 L20 180 Z"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
        opacity="0.25"
      />
      <path
        d="M40 40 L160 40 L160 160 L40 160 Z"
        stroke="currentColor"
        strokeWidth="0.4"
        fill="none"
        opacity="0.2"
      />
      <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.15" />
      <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.12" />
      <circle cx="100" cy="100" r="20" stroke="currentColor" strokeWidth="0.3" fill="none" opacity="0.1" />
      <path d="M100 40 L160 100 L100 160 L40 100 Z" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.15" />
    </svg>
  );
}
