'use client';
import { useRouter } from 'next/navigation';
import G2Logo from '@/components/G2Logo';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="bg-arena bg-grid" style={{ minHeight: '100vh' }}>
      {/* Glow orbs */}
      <div className="fixed top-20 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,73,44,0.12) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
      <div className="fixed bottom-20 right-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(87,70,178,0.08) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }} />

      {/* Nav bar — pinned to top */}
      <nav style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid #1a1a1a', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <G2Logo size={36} />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => router.push('/guest')} className="g2-btn-secondary text-sm px-4 py-2">
            Join Game
          </button>
          <button onClick={() => router.push('/host')} className="g2-btn text-sm px-5 py-2">
            Host a Game
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 1, padding: '80px 32px', textAlign: 'center' }}>
        <div className="animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-8"
            style={{ background: 'rgba(255,73,44,0.1)', border: '1px solid rgba(255,73,44,0.2)', color: '#FF492C' }}>
            ⚡ Real-time · No login required · Unlimited players
          </div>

          <h1 className="font-black text-white tracking-tight mb-4" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 1.05 }}>
            The Ultimate<br />
            <span style={{ color: '#FF492C' }}>Quiz Arena</span>
          </h1>

          <p className="text-gray-400 mb-10 mx-auto" style={{ fontSize: '1.2rem', maxWidth: '600px', lineHeight: 1.6 }}>
            Host real-time trivia battles for your team. Load questions live, from CSV, or Google Sheets. No accounts, no setup — just play.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginBottom: '64px' }}>
            <button onClick={() => router.push('/host')} className="g2-btn text-base px-8 py-4 animate-pulse-glow">
              🎮 Host a Game
            </button>
            <button onClick={() => router.push('/guest')} className="g2-btn-outline text-base px-8 py-4">
              🙋 Join a Game
            </button>
          </div>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', maxWidth: '1200px', margin: '0 auto' }}
          className="animate-fadeInUp">
          {[
            { icon: '✏️', title: 'Type Live', desc: 'Add questions on the fly during setup' },
            { icon: '📄', title: 'CSV Import', desc: 'Upload a spreadsheet with all your questions' },
            { icon: '📊', title: 'Google Sheets', desc: 'Paste a Sheets URL and load instantly' },
            { icon: '🖼️', title: 'Image Support', desc: 'Add images to any question for visual rounds' },
          ].map(f => (
            <div key={f.title} className="g2-card" style={{ textAlign: 'left', padding: '20px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{f.icon}</div>
              <div className="font-bold text-white text-sm" style={{ marginBottom: '4px' }}>{f.title}</div>
              <div className="text-gray-600" style={{ fontSize: '12px', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <p className="text-gray-700 text-xs" style={{ marginTop: '48px' }}>Powered by G2 · Built by IT Team</p>
      </div>
    </div>
  );
}
