import { Question } from './redis';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function parseCSV(content: string): Question[] {
  const lines = content.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const dataLines = lines[0].toLowerCase().includes('question') ? lines.slice(1) : lines;

  return dataLines.map(line => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQuotes = !inQuotes;
      } else if (line[i] === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += line[i];
      }
    }
    fields.push(current.trim());

    const [question, a, b, c, d, correct, points] = fields;
    return {
      id: generateId(),
      question: question || '',
      options: { A: a || '', B: b || '', C: c || '', D: d || '' },
      correct: ((correct || 'A').toUpperCase().trim()) as 'A' | 'B' | 'C' | 'D',
      points: parseInt(points || '100', 10) || 100,
    };
  }).filter(q => q.question);
}

export function parseGoogleSheetsUrl(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) return null;
  const sheetId = match[1];
  const gidMatch = url.match(/gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : '0';
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}
