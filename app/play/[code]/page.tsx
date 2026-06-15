'use client';
import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import G2Logo from '@/components/G2Logo';
import type { GameRoom } from '@/lib/redis';

const OPT_COLORS: Record<string, string> = { A: '#E63946', B: '#2196F3', C: '#4CAF50', D: '#FF9800' };
const OPT_EMOJIS: Record<string, string> = { A: '🔴', B: '🔵', C: '🟢', D: '🟠' };

export default function PlayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerName = searchParams.get('name') || '';
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!playerName) { router.push('/guest'); return; }
    const es = new EventSource(`/api/room/${code}/stream`);
    es.onmessage = e => {
      try {
        const r: GameRoom = JSON.parse(e.data);
        setRoom(prev => {
          if (r.status === 'question' && prev?.currentQuestion !== r.currentQuestion) {
            setSelected(null);
            setSubmitted(false);
          }
          return r;
        });
      } catch {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [code, playerName, router]);

  // Countdown
  useEffect(() => {
    if (!room || room.status !== 'question') return;
    const remaining = Math.max(0, room.timerDefault - Math.floor((Date.now() - (room.timerStart || Date.now())) / 1000));
    setTimeLeft(remaining);
    const iv = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(iv);
  }, [room?.currentQuestion, room?.status]);

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
    <main className="bg-arena min-h-screen flex items-center justify-center">
      <div className="text-center animate-fadeIn">
        <div className="text-5xl mb-4 animate-float">🎯</div>
        <p className="text-gray-500">Connecting...</p>
      </div>
    </main>
  );

  const q = (room.status === 'question' || room.status === 'revealing') ? room.questions[room.currentQuestion] : null;
  const myScore = room.players[playerName]?.score || 0;
  const playerList = Object.values(room.players).sort((a, b) => b.score - a.score);
  const myRank = playerList.findIndex(p => p.name === playerName) + 1;
  const isCorrect = q && room.status === 'revealing' && selected === q.correct;
  const isWrong = q && room.status === 'revealing' && selected && selected !== q.correct;
  const timerPct = room.timerDefault > 0 ? (timeLeft / room.timerDefault) * 100 : 0;

  return (
    <main className="bg-arena min-h-screen flex flex-col p-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-xl" style={{ background: '#111', border: '1px solid #222' }}>
        <G2Logo size={28} />
        <div className="text-center">
          <div className="font-black text-white">{playerName}</div>
        </div>
        <div className="text-right">
          <div className="font-black" style={{ color: '#FF492C' }}>{myScore} pts</div>
          <div className="text-xs text-gray-600">Rank #{myRank}/{playerList.length}</div>
        </div>
      </div>

      {/* Waiting */}
      {room.status === 'waiting' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn">
          <div className="text-7xl mb-6 animate-float">🎮</div>
          <h2 className="text-2xl font-black text-white mb-2">You're in!</h2>
          <p className="text-gray-500 mb-6">Waiting for the host to start...</p>
          <div className="text-5xl font-black tracking-widest mb-4" style={{ color: '#FF492C' }}>{code}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {playerList.length} player{playerList.length !== 1 ? 's' : ''} connected
          </div>
        </div>
      )}

      {/* Question */}
      {room.status === 'question' && q && (
        <div className="flex-1 flex flex-col animate-scaleIn">
          {/* Progress */}
          <div className="flex gap-1 mb-3">
            {room.questions.map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
                style={{ background: i <= room.currentQuestion ? '#FF492C' : '#1a1a1a', opacity: i === room.currentQuestion ? 1 : 0.5 }} />
            ))}
          </div>

          {/* Timer */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">Q{room.currentQuestion + 1}/{room.questions.length}</span>
            <div className="flex items-center gap-2">
              <div className="timer-bar w-24">
                <div className="timer-bar-fill" style={{ width: `${timerPct}%`, background: timerPct > 50 ? '#4ade80' : timerPct > 25 ? '#facc15' : '#FF492C' }} />
              </div>
              <span className="font-black text-lg w-8 text-right"
                style={{ color: timerPct > 50 ? '#4ade80' : timerPct > 25 ? '#facc15' : '#FF492C' }}>
                {timeLeft}
              </span>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: 'rgba(255,73,44,0.15)', color: '#FF492C' }}>
              {q.points}pts
            </span>
          </div>

          {/* Question card */}
          <div className="g2-card mb-4 flex-1 flex flex-col justify-center">
            {q.image && (
              <img src={q.image} alt="Question" className="question-image mb-4" />
            )}
            <h2 className="text-lg font-bold text-white text-center leading-relaxed">{q.question}</h2>
          </div>

          {/* Answer buttons or submitted state */}
          {!submitted ? (
            <div className="grid grid-cols-2 gap-3">
              {(['A', 'B', 'C', 'D'] as const).map(opt => (
                <button key={opt} onClick={() => submitAnswer(opt)}
                  className="answer-btn active:scale-95"
                  style={{ background: OPT_COLORS[opt] }}>
                  <span className="opt-badge">{opt}</span>
                  <span className="text-sm leading-tight">{q.options[opt]}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="g2-card text-center py-6 animate-fadeIn">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-bold text-white">Answer locked in!</p>
              <p className="text-gray-500 text-sm mb-3">Waiting for host...</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white"
                style={{ background: OPT_COLORS[selected!] }}>
                {OPT_EMOJIS[selected!]} You chose {selected}: {q.options[selected as 'A' | 'B' | 'C' | 'D']}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revealing */}
      {room.status === 'revealing' && q && (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-scaleIn">
          <div className="text-6xl mb-4">{isCorrect ? '🎉' : isWrong ? '😔' : '⏰'}</div>
          <h2 className="text-3xl font-black mb-2"
            style={{ color: isCorrect ? '#4ade80' : isWrong ? '#f87171' : '#facc15' }}>
            {isCorrect ? 'Correct!' : isWrong ? 'Wrong!' : "Time's up!"}
          </h2>
          {q.image && <img src={q.image} alt="" className="question-image mb-4 max-w-xs" />}
          <p className="text-gray-400 mb-2">Answer: <span className="font-bold text-white">{q.correct} — {q.options[q.correct]}</span></p>
          {isCorrect && <p className="text-green-400 text-sm font-bold mb-4">+{q.points} points!</p>}
          <div className="g2-card inline-block px-8 py-4 mt-2">
            <div className="text-3xl font-black" style={{ color: '#FF492C' }}>{myScore}</div>
            <div className="text-gray-500 text-xs">Total Points</div>
          </div>
          <p className="text-gray-600 text-sm mt-3">Rank #{myRank}</p>
        </div>
      )}

      {/* Finished */}
      {room.status === 'finished' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn">
          <div className="text-6xl mb-5 animate-float">
            {myRank === 1 ? '🏆' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎮'}
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Game Over!</h2>
          <p className="text-gray-500 mb-6">
            {myRank === 1 ? 'You won! 🎉' : `You finished #${myRank}`}
          </p>
          <div className="g2-card w-full max-w-xs mb-6">
            <h3 className="font-black text-white mb-3">Final Standings</h3>
            <div className="space-y-2">
              {playerList.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3 py-2 px-2 rounded-lg"
                  style={{ background: p.name === playerName ? 'rgba(255,73,44,0.1)' : 'transparent', border: p.name === playerName ? '1px solid rgba(255,73,44,0.2)' : '1px solid transparent' }}>
                  <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-gray-600 text-sm w-5 text-center">{i+1}</span>}</span>
                  <span className={`flex-1 text-sm truncate ${p.name === playerName ? 'font-black text-white' : 'text-gray-400'}`}>{p.name}</span>
                  <span className="font-black text-sm" style={{ color: '#FF492C' }}>{p.score}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => router.push('/')} className="g2-btn px-8">Play Again</button>
        </div>
      )}
    </main>
  );
}
