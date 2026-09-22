export default function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="8" fill="#13261f" />
      <path d="M6 46 L22 24 L32 34 L44 16 L58 46 Z" fill="#c4a574" />
      <path d="M6 46 L58 46 L52 52 L12 52 Z" fill="#2a5344" />
      <circle cx="32" cy="38" r="11" fill="none" stroke="#e8f0ea" strokeWidth="2.2" />
      <circle cx="32" cy="38" r="4.2" fill="#3d8a7a" />
    </svg>
  );
}
