'use client';
import { useRouter } from 'next/navigation';
import G2Logo from '@/components/G2Logo';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a0a0a 100%)' }}>
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="flex justify-center mb-6">
          <G2Logo size={64} />
        </div>
        <h1 className="text-5xl font-bold text-white mb-3">
          Quiz <span style={{ color: '#FF492C' }}>Arena</span>
        </h1>
        <p className="text-gray-400 text-lg">Real-time trivia battles — no login required</p>
      </div>

      {/* Cards */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl">
        {/* Host */}
        <button
          onClick={() => router.push('/host')}
          className="flex-1 g2-card hover:border-red-500 transition-all cursor-pointer text-left group"
          style={{ borderColor: '#2a2a2a' }}
        >
          <div className="text-4xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-white mb-2">Host a Game</h2>
          <p className="text-gray-400 text-sm">Create a room, load questions, and control the game in real-time.</p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: '#FF492C' }}>
            Create Room <span>→</span>
          </div>
        </button>

        {/* Guest */}
        <button
          onClick={() => router.push('/guest')}
          className="flex-1 g2-card hover:border-red-500 transition-all cursor-pointer text-left group"
          style={{ borderColor: '#2a2a2a' }}
        >
          <div className="text-4xl mb-4">🙋</div>
          <h2 className="text-2xl font-bold text-white mb-2">Join a Game</h2>
          <p className="text-gray-400 text-sm">Enter a room code, pick your name, and start competing!</p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: '#FF492C' }}>
            Join Room <span>→</span>
          </div>
        </button>
      </div>

      {/* Footer */}
      <p className="mt-16 text-gray-600 text-sm">Powered by G2 · Built with ❤️ by IT Team</p>
    </main>
  );
}
