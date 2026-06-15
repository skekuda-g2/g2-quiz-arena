'use client';
import { useRouter } from 'next/navigation';
import G2Logo from '@/components/G2Logo';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="bg-arena bg-grid min-h-screen flex flex-col items-center justify-center p-6">
      {/* Glow orbs */}
      <div className="fixed top-20 left-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,73,44,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="fixed bottom-20 right-1/4 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,73,44,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }} />

      {/* Header */}
      <div className="mb-14 text-center animate-fadeInUp">
        <div className="flex justify-center mb-8 animate-float">
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,73,44,0.08)', border: '1px solid rgba(255,73,44,0.2)' }}>
            <img src="/g2-logo.svg" width={72} height={72} alt="G2" />
          </div>
        </div>
        <h1 className="text-6xl font-black text-white mb-3 tracking-tight">
          Quiz <span className="text-gradient">Arena</span>
        </h1>
        <p className="text-gray-500 text-lg">Real-time trivia battles · No login required</p>
      </div>

      {/* Cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
        {/* Host */}
        <button onClick={() => router.push('/host')}
          className="flex-1 g2-card g2-card-glow cursor-pointer text-left group relative overflow-hidden">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,73,44,0.06) 0%, transparent 70%)' }} />
          <div className="relative">
            <div className="text-5xl mb-5">🎮</div>
            <h2 className="text-2xl font-bold text-white mb-2">Host a Game</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Create a room, load questions (live, CSV, or Google Sheets), and control the game in real-time.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-all"
              style={{ background: 'rgba(255,73,44,0.12)', color: '#FF492C' }}>
              Create Room <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </span>
          </div>
        </button>

        {/* Guest */}
        <button onClick={() => router.push('/guest')}
          className="flex-1 g2-card g2-card-glow cursor-pointer text-left group relative overflow-hidden">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'radial-gradient(circle at 70% 50%, rgba(255,73,44,0.06) 0%, transparent 70%)' }} />
          <div className="relative">
            <div className="text-5xl mb-5">🙋</div>
            <h2 className="text-2xl font-bold text-white mb-2">Join a Game</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Enter a 6-digit room code, pick your name, and start competing with others in real-time.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-all"
              style={{ background: 'rgba(255,73,44,0.12)', color: '#FF492C' }}>
              Join Room <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </span>
          </div>
        </button>
      </div>

      {/* Stats / features */}
      <div className="flex gap-8 mt-12 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        {[
          { icon: '⚡', label: 'Real-time' },
          { icon: '🔓', label: 'No login' },
          { icon: '📊', label: 'Sheets support' },
          { icon: '🏆', label: 'Live leaderboard' },
        ].map(f => (
          <div key={f.label} className="flex items-center gap-2 text-gray-600 text-sm">
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </div>
        ))}
      </div>

      <p className="mt-10 text-gray-700 text-xs">Powered by G2 · Built with ❤️ by IT Team</p>
    </main>
  );
}
