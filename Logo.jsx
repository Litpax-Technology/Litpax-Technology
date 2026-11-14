// Litpax logo: "Litpa" wordmark + red/yellow X mark (recreated as SVG).
export function XMark({ size = 33, stroke = 13, className = '' }) {
  return (
    <svg className={className} viewBox="0 0 120 92" width={size} height={size * 0.76} aria-hidden="true">
      <path d="M116 18 C 96 2, 78 6, 62 34 C 48 60, 30 92, 4 74" fill="none" stroke="#E5484D" strokeWidth={stroke} strokeLinecap="round" />
      <path d="M4 18 C 24 2, 42 8, 54 32" fill="none" stroke="#E5484D" strokeWidth={stroke} strokeLinecap="round" />
      <path d="M68 58 C 80 80, 96 90, 116 74" fill="none" stroke="#F3D04A" strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ className = '', href = '#top', as = 'a' }) {
  const Tag = as;
  return (
    <Tag className={`logo ${className}`} {...(as === 'a' ? { href, 'aria-label': 'Litpax home' } : {})}>
      Litpa<XMark />
    </Tag>
  );
}
