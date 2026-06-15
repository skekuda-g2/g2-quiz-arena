'use client';
import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import G2Logo from '@/components/G2Logo';
import type { GameRoom } from '@/lib/redis';

export default function HostGamePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(false);

  // Poll via SSE
  useEffect(() => {
    const es = new EventSource(`/api/room/${code}/stream`);
    es.onmessage = e => {
      try { setRoom(JSON.parse(e.data)); } catch {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [code]);

  const action = useCallback(async (act: string) => {
    setLoading(true);
    await fetch(`/api/room/${code}/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: act }),
    });
    setLoading(false);
  }, [code]);

  if (!room) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-400">Loading room...</p>
      </div>
    </main>
  );

  const q = room.questions[room.currentQuestion];
  const playerList = Object.values(room.players).sort((a, b) => b.score - a.score);
  const answeredCount = q ? Object.values(room.players).filter(p => p.answers[q.id]).length : 0;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/guest` : '';

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <G2Logo size={36} />
          <div className="text-center">
            <div className="text-3xl font-bold tracking-widest" style={{ color: '#FF492C' }}>{code}</div>
            <div className="text-xs text-gray-500">Room Code</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">{playerList.length} player{playerList.length !== 1 ? 's' : ''}</div>
            <div className="text-xs px-2 py-1 rounded mt-1 inline-block"
              style={{ background: room.status === 'waiting' ? '#1a3a1a' : room.status === 'finished' ? '#3a1a1a' : '#1a2a3a',
                       color: room.status === 'waiting' ? '#4ade80' : room.status === 'finished' ? '#f87171' : '#60a5fa' }}>
              {room.status.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main panel */}
          <div className="col-span-2 space-y-4">
            {/* Waiting state */}
            {room.status === 'waiting' && (
              <div className="g2-card text-center py-12">
                <div className="text-5xl mb-4">🎮</div>
                <h2 className="text-2xl font-bold text-white mb-2">Waiting for players...</h2>
                <p className="text-gray-400 mb-6">Share the room code: <span className="font-bold text-white text-xl tracking-widest">{code}</span></p>
                <p className="text-gray-500 text-sm mb-6">Players join at: <span className="text-blue-400">{shareUrl}</span></p>
                <div className="text-gray-400 text-sm mb-8">{room.questions.length} questions · {room.timerDefault}s per question</div>
                {playerList.length > 0 && (
                  <button onClick={() => action('start')} disabled={loading}
                    className="g2-btn text-lg px-8 py-4 animate-pulse-red disabled:opacity-50">
                    🚀 Start Game ({playerList.length} player{playerList.length !== 1 ? 's' : ''})
                  </button>
                )}
                {playerList.length === 0 && <p className="text-gray-600 text-sm">Waiting for at least 1 player to join...</p>}
              </div>
            )}

            {/* Question state */}
            {(room.status === 'question' || room.status === 'revealing') && q && (
              <div className="g2-card">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">Question {room.currentQuestion + 1} / {room.questions.length}</span>
                  <span className="text-sm font-semibold" style={{ color: '#FF492C' }}>{q.points} pts</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-6">{q.question}</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {(['A', 'B', 'C', 'D'] as const).map(opt => (
                    <div key={opt} className={`p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${
                      room.status === 'revealing' && opt === q.correct
                        ? 'border-green-500 bg-green-500/20'
                        : room.status === 'revealing'
                        ? 'border-gray-700 opacity-50'
                        : 'border-gray-700'
                    }`}>
                      <span className="font-bold text-sm w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: '#FF492C', color: 'white' }}>{opt}</span>
                      <span className="text-white text-sm">{q.options[opt]}</span>
                      {room.status === 'revealing' && opt === q.correct && <span className="ml-auto">✅</span>}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    {answeredCount}/{playerList.length} answered
                  </div>
                  <div className="flex gap-3">
                    {room.status === 'question' && (
                      <button onClick={() => action('reveal')} disabled={loading} className="g2-btn disabled:opacity-50">
                        Reveal Answer
                      </button>
                    )}
                    {room.status === 'revealing' && (
                      <button onClick={() => action(room.currentQuestion < room.questions.length - 1 ? 'next' : 'end')}
                        disabled={loading} className="g2-btn disabled:opacity-50">
                        {room.currentQuestion < room.questions.length - 1 ? 'Next Question →' : 'End Game 🏆'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Finished */}
            {room.status === 'finished' && (
              <div className="g2-card text-center py-10">
                <div className="text-5xl mb-4">🏆</div>
                <h2 className="text-2xl font-bold text-white mb-6">Game Over!</h2>
                {playerList[0] && (
                  <div className="text-xl font-bold mb-2" style={{ color: '#FF492C' }}>
                    🥇 {playerList[0].name} wins with {playerList[0].score} points!
                  </div>
                )}
                <button onClick={() => router.push('/host')} className="g2-btn mt-6">
                  New Game
                </button>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="g2-card h-fit">
            <h3 className="font-bold text-white mb-4">🏆 Leaderboard</h3>
            {playerList.length === 0 ? (
              <p className="text-gray-600 text-sm">No players yet</p>
            ) : (
              <div className="space-y-2">
                {playerList.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                    <span className="text-lg font-bold w-6 text-center" style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#666' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </span>
                    <span className="text-white text-sm flex-1 truncate">{p.name}</span>
                    <span className="font-bold text-sm" style={{ color: '#FF492C' }}>{p.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Question progress */}
        {room.status !== 'waiting' && room.status !== 'finished' && (
          <div className="mt-6">
            <div className="flex gap-1">
              {room.questions.map((_, i) => (
                <div key={i} className="flex-1 h-1 rounded-full transition-all"
                  style={{ background: i < room.currentQuestion ? '#FF492C' : i === room.currentQuestion ? '#FF492C' : '#2a2a2a', opacity: i === room.currentQuestion ? 1 : i < room.currentQuestion ? 0.7 : 0.3 }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
