'use client';
import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import G2Logo from '@/components/G2Logo';
import type { GameRoom } from '@/lib/redis';

const OPT_COLORS: Record<string, string> = { A: '#E63946', B: '#2196F3', C: '#4CAF50', D: '#FF9800' };

export default function HostGamePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const es = new EventSource(`/api/room/${code}/stream`);
    es.onmessage = e => { try { setRoom(JSON.parse(e.data)); } catch {} };
    es.onerror = () => es.close();
    return () => es.close();
  }, [code]);

  // Countdown timer
  useEffect(() => {
    if (!room || room.status !== 'question') return;
    const remaining = Math.max(0, room.timerDefault - Math.floor((Date.now() - (room.timerStart || Date.now())) / 1000));
    setTimeLeft(remaining);
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [room?.currentQuestion, room?.status]);

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
    <main className="bg-arena min-h-screen flex items-center justify-center">
      <div className="text-center animate-fadeIn">
        <div className="text-5xl mb-4 animate-float">🎮</div>
        <p className="text-gray-500">Loading game room...</p>
      </div>
    </main>
  );

  const q = room.questions[room.currentQuestion];
  const playerList = Object.values(room.players).sort((a, b) => b.score - a.score);
  const answeredCount = q ? Object.values(room.players).filter(p => p.answers[q.id]).length : 0;
  const timerPct = room.timerDefault > 0 ? (timeLeft / room.timerDefault) * 100 : 0;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/guest` : '';

  return (
    <main className="bg-arena min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 p-3 rounded-xl" style={{ background: '#111', border: '1px solid #222' }}>
          <G2Logo size={32} />
          <div className="text-center">
            <div className="text-2xl font-black tracking-widest" style={{ color: '#FF492C' }}>{code}</div>
            <div className="text-xs text-gray-600">Room Code · {shareUrl}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge badge-${room.status}`}>{room.status}</span>
            <span className="text-sm text-gray-500">{playerList.length} players</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Main */}
          <div className="col-span-2 space-y-4">

            {/* Waiting */}
            {room.status === 'waiting' && (
              <div className="g2-card text-center py-14 animate-fadeInUp">
                <div className="text-6xl mb-5 animate-float">⏳</div>
                <h2 className="text-2xl font-black text-white mb-2">Waiting for players...</h2>
                <p className="text-gray-500 mb-2">Share the code with participants:</p>
                <div className="text-5xl font-black tracking-widest mb-2" style={{ color: '#FF492C' }}>{code}</div>
                <p className="text-gray-600 text-sm mb-2">Join at <span className="text-blue-400">{shareUrl}</span></p>
                <p className="text-gray-600 text-sm mb-8">{room.questions.length} questions · {room.timerDefault}s timer</p>
                {playerList.length > 0 ? (
                  <button onClick={() => action('start')} disabled={loading}
                    className="g2-btn text-lg px-10 py-4 animate-pulse-glow">
                    🚀 Start Game ({playerList.length} player{playerList.length !== 1 ? 's' : ''})
                  </button>
                ) : (
                  <p className="text-gray-700 text-sm">Waiting for at least 1 player...</p>
                )}
              </div>
            )}

            {/* Question */}
            {(room.status === 'question' || room.status === 'revealing') && q && (
              <div className="g2-card animate-scaleIn">
                {/* Progress + timer */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-gray-500">
                    Q{room.currentQuestion + 1}/{room.questions.length}
                  </span>
                  {room.status === 'question' && (
                    <div className="flex items-center gap-2">
                      <div className="timer-bar w-32">
                        <div className="timer-bar-fill"
                          style={{ width: `${timerPct}%`, background: timerPct > 50 ? '#4ade80' : timerPct > 25 ? '#facc15' : '#FF492C' }} />
                      </div>
                      <span className="text-lg font-black w-8 text-right"
                        style={{ color: timerPct > 50 ? '#4ade80' : timerPct > 25 ? '#facc15' : '#FF492C' }}>
                        {timeLeft}
                      </span>
                    </div>
                  )}
                  <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: 'rgba(255,73,44,0.15)', color: '#FF492C' }}>
                    {q.points} pts
                  </span>
                </div>

                {/* Question image */}
                {q.image && (
                  <div className="mb-4">
                    <img src={q.image} alt="Question" className="question-image" />
                  </div>
                )}

                <h2 className="text-xl font-bold text-white mb-5 leading-relaxed">{q.question}</h2>

                {/* Options */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {(['A', 'B', 'C', 'D'] as const).map(opt => (
                    <div key={opt} className="p-3 rounded-xl flex items-center gap-3 transition-all"
                      style={{
                        background: room.status === 'revealing' && opt === q.correct
                          ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${room.status === 'revealing' && opt === q.correct ? '#4ade80' : OPT_COLORS[opt]}`,
                        opacity: room.status === 'revealing' && opt !== q.correct ? 0.4 : 1,
                      }}>
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                        style={{ background: OPT_COLORS[opt] }}>{opt}</span>
                      <span className="text-white text-sm flex-1">{q.options[opt]}</span>
                      {room.status === 'revealing' && opt === q.correct && <span>✅</span>}
                    </div>
                  ))}
                </div>

                {/* Answered count */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-bold text-white">{answeredCount}</span>/{playerList.length} answered
                    <div className="timer-bar mt-1 w-32">
                      <div className="timer-bar-fill" style={{ width: `${playerList.length > 0 ? (answeredCount / playerList.length) * 100 : 0}%`, background: '#FF492C', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {room.status === 'question' && (
                      <button onClick={() => action('reveal')} disabled={loading} className="g2-btn text-sm px-5 py-2">
                        Reveal Answer
                      </button>
                    )}
                    {room.status === 'revealing' && (
                      <button onClick={() => action(room.currentQuestion < room.questions.length - 1 ? 'next' : 'end')}
                        disabled={loading} className="g2-btn text-sm px-5 py-2">
                        {room.currentQuestion < room.questions.length - 1 ? 'Next →' : '🏆 End Game'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Finished */}
            {room.status === 'finished' && (
              <div className="g2-card text-center py-14 animate-scaleIn">
                <div className="text-6xl mb-5 animate-float">🏆</div>
                <h2 className="text-3xl font-black text-white mb-4">Game Over!</h2>
                {playerList[0] && (
                  <div className="text-xl font-bold mb-6" style={{ color: '#FFD700' }}>
                    🥇 {playerList[0].name} wins with {playerList[0].score} pts!
                  </div>
                )}
                <button onClick={() => router.push('/host')} className="g2-btn px-8">New Game</button>
              </div>
            )}

            {/* Progress bar */}
            {room.status !== 'waiting' && room.status !== 'finished' && (
              <div className="flex gap-1">
                {room.questions.map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all"
                    style={{ background: i < room.currentQuestion ? '#FF492C' : i === room.currentQuestion ? '#FF492C' : '#1a1a1a', opacity: i === room.currentQuestion ? 1 : i < room.currentQuestion ? 0.6 : 0.3 }} />
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="g2-card h-fit sticky top-4">
            <h3 className="font-black text-white mb-4 flex items-center gap-2">
              <span>🏆</span> Leaderboard
            </h3>
            {playerList.length === 0 ? (
              <p className="text-gray-700 text-sm">No players yet</p>
            ) : (
              <div className="space-y-1">
                {playerList.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-2 py-2 px-2 rounded-lg transition-all"
                    style={{ background: i === 0 ? 'rgba(255,215,0,0.08)' : 'transparent' }}>
                    <span className="rank-badge">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-sm text-gray-600">{i + 1}</span>}
                    </span>
                    <span className="text-white text-sm flex-1 truncate font-medium">{p.name}</span>
                    <span className="font-black text-sm" style={{ color: '#FF492C' }}>{p.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
