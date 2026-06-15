import { NextRequest, NextResponse } from 'next/server';
import { getRoom, setRoom } from '@/lib/redis';

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { name } = await req.json();

  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const room = await getRoom(code.toUpperCase());
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  if (room.status === 'finished') return NextResponse.json({ error: 'Game already ended' }, { status: 400 });

  const playerName = name.trim();
  if (!room.players[playerName]) {
    room.players[playerName] = { name: playerName, score: 0, answers: {} };
    await setRoom(room);
  }

  return NextResponse.json({ success: true, room });
}
