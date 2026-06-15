import { NextRequest, NextResponse } from 'next/server';
import { getRoom, setRoom } from '@/lib/redis';

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { playerName, answer, questionId } = await req.json();

  const room = await getRoom(code.toUpperCase());
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  if (room.status !== 'question') return NextResponse.json({ error: 'Not accepting answers' }, { status: 400 });

  const player = room.players[playerName];
  if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });

  // Only allow one answer per question
  if (!player.answers[questionId]) {
    player.answers[questionId] = answer;
    await setRoom(room);
  }

  return NextResponse.json({ success: true });
}
