'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import G2Logo from '@/components/G2Logo';
import { parseCSV } from '@/lib/csv';
import type { Question } from '@/lib/redis';

type LoadMode = 'live' | 'csv' | 'sheets';

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

const emptyQuestion = (): Question => ({
  id: generateId(),
  question: '',
  options: { A: '', B: '', C: '', D: '' },
  correct: 'A',
  points: 100,
});

export default function HostPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoadMode>('live');
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const updateQuestion = (i: number, field: string, value: string) => {
    const updated = [...questions];
    if (field.startsWith('option_')) {
      const opt = field.split('_')[1] as 'A' | 'B' | 'C' | 'D';
      updated[i] = { ...updated[i], options: { ...updated[i].options, [opt]: value } };
    } else if (field === 'correct') {
      updated[i] = { ...updated[i], correct: value as 'A' | 'B' | 'C' | 'D' };
    } else if (field === 'points') {
      updated[i] = { ...updated[i], points: parseInt(value) || 100 };
    } else {
      updated[i] = { ...updated[i], question: value };
    }
    setQuestions(updated);
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length > 0) setQuestions(parsed);
      else setError('No valid questions found in CSV');
    };
    reader.readAsText(file);
  };

  const loadSheets = async () => {
    if (!sheetsUrl) return setError('Enter a Google Sheets URL');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sheetsUrl }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setQuestions(data.questions);
    } catch {
      setError('Failed to load sheet');
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    const valid = questions.filter(q => q.question.trim() && q.options.A && q.options.B && q.options.C && q.options.D);
    if (valid.length === 0) return setError('Add at least one complete question');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: valid, timer, hostId: 'host-' + Date.now() }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      router.push(`/host/${data.code}`);
    } catch (e: any) {
      setError('Failed to create room: ' + (e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <G2Logo size={40} />
          <button onClick={() => router.push('/')} className="text-gray-500 hover:text-white text-sm">← Back</button>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Create a Game</h1>
        <p className="text-gray-400 mb-8">Set up your questions and start the quiz</p>

        {/* Timer */}
        <div className="g2-card mb-6">
          <label className="block text-sm text-gray-400 mb-3">⏱ Timer per question (seconds)</label>
          <div className="flex gap-3 flex-wrap">
            {[15, 20, 30, 45, 60].map(t => (
              <button key={t} onClick={() => setTimer(t)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${timer === t ? 'text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                style={timer === t ? { background: '#FF492C' } : {}}>
                {t}s
              </button>
            ))}
            <input type="number" min={5} max={300} value={timer} onChange={e => setTimer(parseInt(e.target.value) || 30)}
              className="g2-input w-24 text-center" placeholder="Custom" />
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-6">
          {(['live', 'csv', 'sheets'] as LoadMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              style={mode === m ? { background: '#FF492C' } : {}}>
              {m === 'live' ? '✏️ Type Live' : m === 'csv' ? '📄 Upload CSV' : '📊 Google Sheets'}
            </button>
          ))}
        </div>

        {/* CSV Mode */}
        {mode === 'csv' && (
          <div className="g2-card mb-6">
            <p className="text-gray-400 text-sm mb-3">CSV format: <code className="text-green-400">Question, A, B, C, D, Correct, Points</code></p>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="g2-btn-outline">
              Choose CSV File
            </button>
            {questions.length > 0 && questions[0].question && (
              <p className="text-green-400 text-sm mt-3">✅ {questions.length} questions loaded</p>
            )}
          </div>
        )}

        {/* Sheets Mode */}
        {mode === 'sheets' && (
          <div className="g2-card mb-6">
            <p className="text-gray-400 text-sm mb-3">Paste your Google Sheets URL. Sheet must be set to "Anyone with the link can view".</p>
            <div className="flex gap-3">
              <input className="g2-input flex-1" placeholder="https://docs.google.com/spreadsheets/d/..." value={sheetsUrl} onChange={e => setSheetsUrl(e.target.value)} />
              <button onClick={loadSheets} disabled={loading} className="g2-btn whitespace-nowrap">
                {loading ? 'Loading...' : 'Load Sheet'}
              </button>
            </div>
            {questions.length > 0 && questions[0].question && (
              <p className="text-green-400 text-sm mt-3">✅ {questions.length} questions loaded</p>
            )}
          </div>
        )}

        {/* Live / Questions List */}
        {(mode === 'live' || questions.length > 0) && (
          <div className="space-y-4 mb-6">
            {questions.map((q, i) => (
              <div key={q.id} className="g2-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-400">Question {i + 1}</span>
                  {questions.length > 1 && (
                    <button onClick={() => setQuestions(questions.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                  )}
                </div>
                <input className="g2-input mb-3" placeholder="Enter your question..." value={q.question}
                  onChange={e => updateQuestion(i, 'question', e.target.value)} />
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {(['A', 'B', 'C', 'D'] as const).map(opt => (
                    <div key={opt} className="flex items-center gap-2">
                      <span className="text-xs font-bold w-5 text-center"
                        style={{ color: q.correct === opt ? '#FF492C' : '#666' }}>{opt}</span>
                      <input className="g2-input flex-1 text-sm" placeholder={`Option ${opt}`}
                        value={q.options[opt]} onChange={e => updateQuestion(i, `option_${opt}`, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 items-center">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Correct Answer</label>
                    <select className="g2-input w-24 text-sm" value={q.correct}
                      onChange={e => updateQuestion(i, 'correct', e.target.value)}>
                      {(['A', 'B', 'C', 'D'] as const).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Points</label>
                    <input type="number" className="g2-input w-24 text-sm" value={q.points}
                      onChange={e => updateQuestion(i, 'points', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            {mode === 'live' && (
              <button onClick={() => setQuestions([...questions, emptyQuestion()])}
                className="w-full py-3 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:border-red-500 hover:text-white transition-all text-sm">
                + Add Question
              </button>
            )}
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button onClick={createRoom} disabled={loading} className="g2-btn w-full text-lg py-4 disabled:opacity-50">
          {loading ? 'Creating Room...' : '🚀 Create Room & Start'}
        </button>
      </div>
    </main>
  );
}
