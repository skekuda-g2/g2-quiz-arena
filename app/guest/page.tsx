'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import G2Logo from '@/components/G2Logo';

export default function GuestPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const join = async () => {
    if (!code.trim() || !name.trim()) return setError('Please enter both room code and your name');
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/room/${code.toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Failed to join');
      router.push(`/play/${code.toUpperCase()}?name=${encodeURIComponent(name.trim())}`);
    } catch (e: any) {
      setError('Connection error: ' + (e?.message || String(e)));
    } finally { setLoading(false); }
  };

  return (
    <main className="bg-arena bg-grid min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md animate-fadeInUp">
        <div className="flex justify-center mb-10">
          <G2Logo size={44} />
        </div>

        <div className="g2-card">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🎯</div>
            <h1 className="text-2xl font-black text-white">Join a Game</h1>
            <p className="text-gray-500 text-sm mt-1">Enter the room code from your host</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="g2-label">Room Code</label>
              <input className="g2-input text-center text-3xl font-black tracking-widest uppercase"
                placeholder="ABC123" value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                maxLength={6} onKeyDown={e => e.key === 'Enter' && join()} />
            </div>
            <div>
              <label className="g2-label">Your Name</label>
              <input className="g2-input" placeholder="Enter your name..."
                value={name} onChange={e => setName(e.target.value)}
                maxLength={20} onKeyDown={e => e.key === 'Enter' && join()} />
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(255,73,44,0.1)', border: '1px solid rgba(255,73,44,0.3)', color: '#ff8c6b' }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={join} disabled={loading || !code.trim() || !name.trim()}
              className="g2-btn w-full py-3 disabled:opacity-40">
              {loading ? '⏳ Joining...' : 'Join Game 🚀'}
            </button>
          </div>
        </div>

        <button onClick={() => router.push('/')}
          className="mt-6 text-gray-600 text-sm hover:text-white w-full text-center transition-colors">
          ← Back to Home
        </button>
      </div>
    </main>
  );
}
