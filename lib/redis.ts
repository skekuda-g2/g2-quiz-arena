// Use direct HTTP calls to Upstash REST API instead of SDK to avoid bundling issues

const getUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const getToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

async function upstash(command: string[]): Promise<any> {
  const url = getUrl();
  const token = getToken();
  
  if (!url || !token) {
    throw new Error(`Missing Redis config. URL: ${!!url}, Token: ${!!token}`);
  }

  const res = await fetch(`${url}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstash error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.result;
}

export const redis = {
  async set(key: string, value: any, opts?: { ex?: number }): Promise<void> {
    const cmd: any[] = ['SET', key, JSON.stringify(value)];
    if (opts?.ex) cmd.push('EX', opts.ex);
    await upstash(cmd);
  },
  async get<T>(key: string): Promise<T | null> {
    const result = await upstash(['GET', key]);
    if (!result) return null;
    try { return JSON.parse(result) as T; } catch { return result as T; }
  },
  async del(key: string): Promise<void> {
    await upstash(['DEL', key]);
  },
};

export type Question = {
  id: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: 'A' | 'B' | 'C' | 'D';
  points: number;
  image?: string; // URL or base64
};

export type Player = {
  name: string;
  score: number;
  answers: Record<string, string>;
};

export type GameRoom = {
  code: string;
  status: 'waiting' | 'active' | 'question' | 'revealing' | 'finished';
  questions: Question[];
  currentQuestion: number;
  timer: number;
  timerDefault: number;
  timerStart?: number;
  players: Record<string, Player>;
  hostId: string;
  createdAt: number;
  updatedAt: number;
};

export const ROOM_TTL = 60 * 60 * 4; // 4 hours

export async function getRoom(code: string): Promise<GameRoom | null> {
  return redis.get<GameRoom>(`room:${code}`);
}

export async function setRoom(room: GameRoom): Promise<void> {
  room.updatedAt = Date.now();
  await redis.set(`room:${room.code}`, room, { ex: ROOM_TTL });
}

export function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
