'use client';
import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import G2Logo from '@/components/G2Logo';
import type { GameRoom } from '@/lib/redis';

export default function PlayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerName = searchParams.get('name') || '';
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!playerName) { router.push('/guest'); return; }
    const es = new EventSource(`/api/room/${code}/stream`);
    es.onmessage = e => {
      try {
        const r: GameRoom = JSON.parse(e.data);
        setRoom(r);
        // Reset answer state when question changes
        if (r.status === 'question') {
          const q = r.questions[r.currentQuestion];
          const player = r.players[playerName];
          if (q && player && !player.answers[q.id]) {
            setSelected(null);
            setSubmitted(false);
          }
        }
      } catch {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [code, playerName, router]);

  const submitAnswer = async (answer: string) => {
    if (submitted || !room || room.status !== 'question') return;
    const q = room.questions[room.currentQuestion];
    if (!q) return;
    setSelected(answer);
    setSubmitted(true);
    await fetch(`/api/room/${code}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName, answer, questionId: q.id }),
    });
  };

  if (!room) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-spin">🎯</div>
        <p className="text-gray-400">Connecting to game...</p>
      </div>
    </main>
  );

  const q = room.status === 'question' || room.status === 'revealing' ? room.questions[room.currentQuestion] : null;
  const myScore = room.players[playerName]?.score || 0;
  const playerList = Object.values(room.players).sort((a, b) => b.score - a.score);
  const myRank = playerList.findIndex(p => p.name === playerName) + 1;
  const isCorrect = q && room.status === 'revealing' && selected === q.correct;
  const isWrong = q && room.status === 'revealing' && selected && selected !== q.correct;

  const optionColors: Record<string, string> = { A: '#E63946', B: '#2196F3', C: '#4CAF50', D: '#FF9800' };

  return (
    <main className="min-h-screen p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <G2Logo size={32} />
        <div className="text-center">
          <div className="text-sm text-gray-400">{playerName}</div>
          <div className="font-bold" style={{ color: '#FF492C' }}>{myScore} pts</div>
        </div>
        <div className="text-right text-sm text-gray-400">
          #{myRank} of {playerList.length}
        </div>
      </div>

      {/* Waiting */}
      {room.status === 'waiting' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-6 animate-bounce">⏳</div>
          <h2 className="text-2xl font-bold text-white mb-2">You're in!</h2>
          <p className="text-gray-400 mb-4">Waiting for the host to start the game...</p>
          <div className="text-4xl font-bold tracking-widest" style={{ color: '#FF492C' }}>{code}</div>
          <p className="text-gray-600 text-sm mt-4">{playerList.length} player{playerList.length !== 1 ? 's' : ''} in the room</p>
        </div>
      )}

      {/* Active Question */}
      {room.status === 'question' && q && (
        <div className="flex-1 flex flex-col">
          {/* Progress */}
          <div className="flex gap-1 mb-4">
            {room.questions.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full"
                style={{ background: i <= room.currentQuestion ? '#FF492C' : '#2a2a2a', opacity: i === room.currentQuestion ? 1 : 0.5 }} />
            ))}
          </div>

          <div className="text-xs text-gray-500 mb-2">Question {room.currentQuestion + 1} of {room.questions.length} · {q.points} pts</div>

          <div className="g2-card mb-4 flex-1 flex items-center justify-center">
            <h2 className="text-xl font-bold text-white text-center leading-relaxed">{q.question}</h2>
          </div>

          {!submitted ? (
            <div className="grid grid-cols-2 gap-3">
              {(['A', 'B', 'C', 'D'] as const).map(opt => (
                <button key={opt} onClick={() => submitAnswer(opt)}
                  className="p-4 rounded-xl font-semibold text-white text-left transition-all active:scale-95 flex items-center gap-3"
                  style={{ background: optionColors[opt] }}>
                  <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm flex-shrink-0">{opt}</span>
                  <span className="text-sm">{q.options[opt]}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="g2-card text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-white font-semibold">Answer submitted!</p>
              <p className="text-gray-400 text-sm mt-1">Waiting for host to reveal...</p>
              <div className="mt-4 inline-block px-4 py-2 rounded-lg font-bold"
                style={{ background: optionColors[selected!], color: 'white' }}>
                You chose: {selected}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revealing */}
      {room.status === 'revealing' && q && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-4">{isCorrect ? '🎉' : isWrong ? '😔' : '⏰'}</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: isCorrect ? '#4ade80' : isWrong ? '#f87171' : '#facc15' }}>
            {isCorrect ? 'Correct!' : isWrong ? 'Wrong!' : 'Time\'s up!'}
          </h2>
          <p className="text-gray-400 mb-4">Correct answer: <span className="font-bold text-white">{q.correct} — {q.options[q.correct]}</span></p>
          <div className="text-2xl font-bold" style={{ color: '#FF492C' }}>{myScore} pts</div>
          <p className="text-gray-500 text-sm mt-2">Rank #{myRank}</p>
        </div>
      )}

      {/* Finished */}
      {room.status === 'finished' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-white mb-6">Game Over!</h2>
          <div className="g2-card w-full max-w-sm mb-6">
            <h3 className="font-bold text-white mb-4">Final Leaderboard</h3>
            <div className="space-y-2">
              {playerList.map((p, i) => (
                <div key={p.name} className={`flex items-center gap-3 py-2 rounded-lg px-2 ${p.name === playerName ? 'bg-red-500/10' : ''}`}>
                  <span className="text-lg w-6 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}</span>
                  <span className={`flex-1 text-sm ${p.name === playerName ? 'font-bold text-white' : 'text-gray-300'}`}>{p.name}</span>
                  <span className="font-bold text-sm" style={{ color: '#FF492C' }}>{p.score}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => router.push('/')} className="g2-btn">Play Again</button>
        </div>
      )}
    </main>
  );
}
