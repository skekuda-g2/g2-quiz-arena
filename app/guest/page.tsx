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
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/room/${code.toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Failed to join');
      router.push(`/play/${code.toUpperCase()}?name=${encodeURIComponent(name.trim())}`);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10">
          <G2Logo size={48} />
        </div>

        <div className="g2-card">
          <h1 className="text-2xl font-bold text-white mb-2">Join a Game</h1>
          <p className="text-gray-400 text-sm mb-6">Enter the room code from your host</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Room Code</label>
              <input
                className="g2-input text-center text-2xl font-bold tracking-widest uppercase"
                placeholder="ABC123"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                onKeyDown={e => e.key === 'Enter' && join()}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Your Name</label>
              <input
                className="g2-input"
                placeholder="Enter your name"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={20}
                onKeyDown={e => e.key === 'Enter' && join()}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={join}
              disabled={loading}
              className="g2-btn w-full disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join Game 🚀'}
            </button>
          </div>
        </div>

        <button onClick={() => router.push('/')} className="mt-6 text-gray-500 text-sm hover:text-white w-full text-center transition-colors">
          ← Back to Home
        </button>
      </div>
    </main>
  );
}
