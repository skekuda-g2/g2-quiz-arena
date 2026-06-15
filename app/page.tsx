'use client';
import { useRouter } from 'next/navigation';
import G2Logo from '@/components/G2Logo';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="bg-arena bg-grid min-h-screen flex flex-col" style={{ alignItems: 'stretch' }}>
      {/* Glow orbs */}
      <div className="fixed top-20 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,73,44,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="fixed bottom-20 right-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(87,70,178,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Nav bar */}
      <nav className="w-full px-8 py-5 flex items-center justify-between border-b" style={{ borderColor: '#1a1a1a' }}>
        <G2Logo size={36} />
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/guest')} className="g2-btn-secondary text-sm px-4 py-2">
            Join Game
          </button>
          <button onClick={() => router.push('/host')} className="g2-btn text-sm px-5 py-2">
            Host a Game
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button onClick={() => router.push('/host')}
              className="g2-btn text-base px-8 py-4 animate-pulse-glow w-full sm:w-auto">
              🎮 Host a Game
            </button>
            <button onClick={() => router.push('/guest')}
              className="g2-btn-outline text-base px-8 py-4 w-full sm:w-auto">
              🙋 Join a Game
            </button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
          {[
            { icon: '✏️', title: 'Type Live', desc: 'Add questions on the fly during setup' },
            { icon: '📄', title: 'CSV Import', desc: 'Upload a spreadsheet with all your questions' },
            { icon: '📊', title: 'Google Sheets', desc: 'Paste a Sheets URL and load instantly' },
            { icon: '🖼️', title: 'Image Support', desc: 'Add images to any question for visual rounds' },
          ].map(f => (
            <div key={f.title} className="g2-card text-left p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-bold text-white text-sm mb-1">{f.title}</div>
              <div className="text-gray-600 text-xs leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Brand colors bar */}
        <div className="flex gap-2 mt-12">
          {['#FF492C', '#5746B2', '#288DFF', '#27D3BC', '#FFC800'].map(c => (
            <div key={c} className="w-6 h-6 rounded-full" style={{ background: c, opacity: 0.6 }} />
          ))}
        </div>

        <p className="mt-6 text-gray-700 text-xs">Powered by G2 · Built by IT Team</p>
      </div>
    </main>
  );
}
