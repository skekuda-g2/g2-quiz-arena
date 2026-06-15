'use client';
import { useRouter } from 'next/navigation';
import G2Logo from '@/components/G2Logo';

export default function HomePage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'block' }}>
      {/* Nav bar */}
      <nav style={{
        width: '100%',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #1a1a1a',
        background: '#0a0a0a',
        boxSizing: 'border-box',
      }}>
        <G2Logo size={36} />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => router.push('/guest')} className="g2-btn-secondary text-sm" style={{ padding: '8px 16px' }}>
            Join Game
          </button>
          <button onClick={() => router.push('/host')} className="g2-btn text-sm" style={{ padding: '8px 20px' }}>
            Host a Game
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ padding: '80px 32px', textAlign: 'center' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 16px', borderRadius: '999px', marginBottom: '32px',
          background: 'rgba(255,73,44,0.1)', border: '1px solid rgba(255,73,44,0.2)',
          color: '#FF492C', fontSize: '12px', fontWeight: 700,
        }}>
          ⚡ Real-time · No login required · Unlimited players
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', fontWeight: 900,
          color: 'white', lineHeight: 1.05, marginBottom: '20px', letterSpacing: '-0.02em',
        }}>
          The Ultimate<br />
          <span style={{ color: '#FF492C' }}>Quiz Arena</span>
        </h1>

        <p style={{
          color: '#888', fontSize: '1.1rem', maxWidth: '560px',
          margin: '0 auto 40px', lineHeight: 1.6,
        }}>
          Host real-time trivia battles for your team. Load questions live, from CSV, or Google Sheets. No accounts, no setup — just play.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '80px' }}>
          <button onClick={() => router.push('/host')} className="g2-btn" style={{ fontSize: '16px', padding: '14px 36px' }}>
            🎮 Host a Game
          </button>
          <button onClick={() => router.push('/guest')} className="g2-btn-outline" style={{ fontSize: '16px', padding: '14px 36px' }}>
            🙋 Join a Game
          </button>
        </div>

        {/* Feature cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          maxWidth: '1100px',
          margin: '0 auto 48px',
        }}>
          {[
            { icon: '✏️', title: 'Type Live', desc: 'Add questions on the fly during setup' },
            { icon: '📄', title: 'CSV Import', desc: 'Upload a spreadsheet with all your questions' },
            { icon: '📊', title: 'Google Sheets', desc: 'Paste a Sheets URL and load instantly' },
            { icon: '🖼️', title: 'Image Support', desc: 'Add images to any question for visual rounds' },
          ].map(f => (
            <div key={f.title} style={{
              background: '#111', border: '1px solid #222', borderRadius: '16px',
              padding: '20px', textAlign: 'left',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{f.icon}</div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '14px', marginBottom: '4px' }}>{f.title}</div>
              <div style={{ color: '#555', fontSize: '12px', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <p style={{ color: '#333', fontSize: '12px' }}>Powered by G2 · Built by IT Team</p>
      </div>
    </div>
  );
}
