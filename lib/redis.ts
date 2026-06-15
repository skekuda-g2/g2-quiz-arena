import { Redis } from '@upstash/redis';

const url = process.env.KV_REST_API_URL || 
            process.env.UPSTASH_REDIS_REST_URL || 
            process.env.STORAGE_REST_API_URL ||
            '';

const token = process.env.KV_REST_API_TOKEN || 
              process.env.UPSTASH_REDIS_REST_TOKEN || 
              process.env.STORAGE_REST_API_TOKEN ||
              '';

if (!url || !token) {
  console.error('Missing Redis env vars. Available:', Object.keys(process.env).filter(k => k.includes('KV') || k.includes('UPSTASH') || k.includes('REDIS') || k.includes('STORAGE')));
}

export const redis = new Redis({ url, token });

export type Question = {
  id: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: 'A' | 'B' | 'C' | 'D';
  points: number;
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
