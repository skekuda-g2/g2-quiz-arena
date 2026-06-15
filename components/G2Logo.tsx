'use client';
import Link from 'next/link';

export default function G2Logo({ size = 40, clickable = true }: { size?: number; clickable?: boolean }) {
  const content = (
    <div className="flex items-center gap-3" style={{ cursor: clickable ? 'pointer' : 'default' }}>
      <img
        src="https://company.g2.com/hubfs/brand-guide/g2-logo-rorange.svg"
        width={size}
        height={size}
        alt="G2"
        style={{ flexShrink: 0 }}
        onError={(e) => {
          // Fallback to local SVG if CDN fails
          (e.target as HTMLImageElement).src = '/g2-logo.svg';
        }}
      />
      <span className="font-black text-white tracking-tight" style={{ fontSize: size * 0.45 }}>
        Quiz <span style={{ color: '#FF492C' }}>Arena</span>
      </span>
    </div>
  );

  if (!clickable) return content;

  return (
    <Link href="https://g2-quiz-arena.vercel.app/" style={{ textDecoration: 'none' }}>
      {content}
    </Link>
  );
}
