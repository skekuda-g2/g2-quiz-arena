'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import G2Logo from '@/components/G2Logo';
import { parseCSV } from '@/lib/csv';
import type { Question } from '@/lib/redis';

type LoadMode = 'live' | 'csv' | 'sheets';

function generateId() { return Math.random().toString(36).substring(2, 10); }

const emptyQuestion = (): Question => ({
  id: generateId(),
  question: '',
  options: { A: '', B: '', C: '', D: '' },
  correct: 'A',
  points: 100,
  image: '',
});

const OPT_COLORS: Record<string, string> = {
  A: '#E63946', B: '#2196F3', C: '#4CAF50', D: '#FF9800'
};

export default function HostPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoadMode>('live');
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const updateQuestion = (i: number, field: string, value: string) => {
    const updated = [...questions];
    if (field.startsWith('option_')) {
      const opt = field.split('_')[1] as 'A' | 'B' | 'C' | 'D';
      updated[i] = { ...updated[i], options: { ...updated[i].options, [opt]: value } };
    } else if (field === 'correct') {
      updated[i] = { ...updated[i], correct: value as 'A' | 'B' | 'C' | 'D' };
    } else if (field === 'points') {
      updated[i] = { ...updated[i], points: parseInt(value) || 100 };
    } else if (field === 'image') {
      updated[i] = { ...updated[i], image: value };
    } else {
      updated[i] = { ...updated[i], question: value };
    }
    setQuestions(updated);
  };

  const handleImageFile = (i: number, file: File) => {
    // Reject files over 2MB before processing
    if (file.size > 2 * 1024 * 1024) {
      setError('Image too large (max 2MB). Please use a smaller image or paste a URL instead.');
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // Max 600px wide to keep Redis payload small
        const maxW = 600;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Compress to JPEG at 60% quality — keeps it under ~50KB
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        updateQuestion(i, 'image', compressed);
      } catch (e) {
        setError('Failed to process image. Try a URL instead.');
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      setError('Could not load image file.');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length > 0) { setQuestions(parsed); setMode('live'); }
      else setError('No valid questions found in CSV');
    };
    reader.readAsText(file);
  };

  const loadSheets = async () => {
    if (!sheetsUrl) return setError('Enter a Google Sheets URL');
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sheetsUrl }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setQuestions(data.questions);
      setMode('live');
    } catch { setError('Failed to load sheet'); }
    finally { setLoading(false); }
  };

  const createRoom = async () => {
    const valid = questions.filter(q => q.question.trim() && q.options.A && q.options.B && q.options.C && q.options.D);
    if (valid.length === 0) return setError('Add at least one complete question (all 4 options required)');
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: valid, timer, hostId: 'host-' + Date.now() }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Server error');
      router.push(`/host/${data.code}`);
    } catch (e: any) {
      setError('Network error: ' + (e?.message || String(e)));
    } finally { setLoading(false); }
  };

  return (
    <main className="bg-arena min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <G2Logo size={36} />
          <button onClick={() => router.push('/')} className="g2-btn-secondary text-sm px-4 py-2">← Back</button>
        </div>

        <h1 className="text-3xl font-black text-white mb-1">Create a Game</h1>
        <p className="text-gray-500 mb-8">Set up your questions and launch the quiz</p>

        {/* Timer */}
        <div className="g2-card mb-5">
          <label className="g2-label">⏱ Timer per question</label>
          <div className="flex gap-2 flex-wrap">
            {[15, 20, 30, 45, 60].map(t => (
              <button key={t} onClick={() => setTimer(t)}
                className="px-4 py-2 rounded-lg font-bold text-sm transition-all"
                style={timer === t ? { background: '#FF492C', color: 'white' } : { background: '#1a1a1a', color: '#666', border: '1px solid #2a2a2a' }}>
                {t}s
              </button>
            ))}
            <input type="number" min={5} max={300} value={timer}
              onChange={e => setTimer(parseInt(e.target.value) || 30)}
              className="g2-input w-20 text-center text-sm" placeholder="sec" />
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-5 p-1 rounded-xl" style={{ background: '#111', border: '1px solid #222' }}>
          {(['live', 'csv', 'sheets'] as LoadMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
              style={mode === m ? { background: '#FF492C', color: 'white' } : { color: '#555' }}>
              {m === 'live' ? '✏️ Type Live' : m === 'csv' ? '📄 CSV' : '📊 Sheets'}
            </button>
          ))}
        </div>

        {/* CSV */}
        {mode === 'csv' && (
          <div className="g2-card mb-5">
            <p className="text-gray-500 text-sm mb-1">Format: <code className="text-green-400 text-xs">Question, A, B, C, D, Correct, Points</code></p>
            <p className="text-gray-600 text-xs mb-4">Header row is optional. Correct = A/B/C/D. Points = number (default 100)</p>
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleCSV} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="g2-btn-outline text-sm">📄 Choose CSV File</button>
          </div>
        )}

        {/* Sheets */}
        {mode === 'sheets' && (
          <div className="g2-card mb-5">
            <p className="text-gray-500 text-sm mb-4">Sheet must be <strong className="text-white">"Anyone with the link can view"</strong>. Same format as CSV.</p>
            <div className="flex gap-3">
              <input className="g2-input flex-1 text-sm" placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetsUrl} onChange={e => setSheetsUrl(e.target.value)} />
              <button onClick={loadSheets} disabled={loading} className="g2-btn text-sm px-5 disabled:opacity-50">
                {loading ? '...' : 'Load'}
              </button>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-4 mb-5">
          {questions.map((q, i) => (
            <div key={q.id} className="g2-card animate-fadeInUp" style={{ animationDelay: `${i * 0.05}s` }}>
              {/* Question header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: '#FF492C' }}>{i + 1}</span>
                  <span className="text-sm font-semibold text-gray-400">Question {i + 1}</span>
                </div>
                {questions.length > 1 && (
                  <button onClick={() => setQuestions(questions.filter((_, j) => j !== i))}
                    className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded transition-colors">
                    Remove ✕
                  </button>
                )}
              </div>

              {/* Question text */}
              <textarea className="g2-input mb-4 resize-none text-sm" rows={2}
                placeholder="Enter your question..." value={q.question}
                onChange={e => updateQuestion(i, 'question', e.target.value)} />

              {/* Image section */}
              <div className="mb-4">
                <label className="g2-label">🖼 Question Image (optional)</label>
                <div className="flex gap-2 mb-2">
                  <input className="g2-input flex-1 text-sm" placeholder="Paste image URL..."
                    value={q.image?.startsWith('data:') ? '' : (q.image || '')}
                    onChange={e => updateQuestion(i, 'image', e.target.value)} />
                  <span className="text-gray-600 text-xs flex items-center px-2">or</span>
                  <input ref={el => { imageRefs.current[q.id] = el; }} type="file"
                    accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(i, f); }} />
                  <button onClick={() => imageRefs.current[q.id]?.click()}
                    className="g2-btn-secondary text-xs px-3 py-2 whitespace-nowrap">
                    📁 Upload
                  </button>
                </div>
                {q.image && (
                  <div className="relative">
                    <img src={q.image} alt="Question" className="question-image" onError={() => updateQuestion(i, 'image', '')} />
                    <button onClick={() => updateQuestion(i, 'image', '')}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}>✕</button>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(['A', 'B', 'C', 'D'] as const).map(opt => (
                  <div key={opt} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 text-white"
                      style={{ background: OPT_COLORS[opt], opacity: q.correct === opt ? 1 : 0.5 }}>
                      {opt}
                    </div>
                    <input className="g2-input flex-1 text-sm" placeholder={`Option ${opt}`}
                      value={q.options[opt]} onChange={e => updateQuestion(i, `option_${opt}`, e.target.value)} />
                  </div>
                ))}
              </div>

              {/* Correct + Points */}
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="g2-label">Correct Answer</label>
                  <div className="flex gap-2">
                    {(['A', 'B', 'C', 'D'] as const).map(opt => (
                      <button key={opt} onClick={() => updateQuestion(i, 'correct', opt)}
                        className="flex-1 py-2 rounded-lg text-sm font-black transition-all"
                        style={q.correct === opt
                          ? { background: OPT_COLORS[opt], color: 'white' }
                          : { background: '#1a1a1a', color: '#555', border: '1px solid #2a2a2a' }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="g2-label">Points</label>
                  <input type="number" className="g2-input w-24 text-sm text-center" value={q.points}
                    onChange={e => updateQuestion(i, 'points', e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          {/* Add question */}
          <button onClick={() => setQuestions([...questions, emptyQuestion()])}
            className="w-full py-4 border-2 border-dashed rounded-xl text-sm font-semibold transition-all"
            style={{ borderColor: '#2a2a2a', color: '#444' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = '#FF492C'; (e.target as HTMLElement).style.color = '#FF492C'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = '#2a2a2a'; (e.target as HTMLElement).style.color = '#444'; }}>
            + Add Question
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(255,73,44,0.1)', border: '1px solid rgba(255,73,44,0.3)', color: '#ff8c6b' }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={createRoom} disabled={loading}
          className="g2-btn w-full text-base py-4 disabled:opacity-50 animate-pulse-glow">
          {loading ? '⏳ Creating Room...' : `🚀 Launch Game (${questions.filter(q => q.question.trim()).length} questions)`}
        </button>
      </div>
    </main>
  );
}
