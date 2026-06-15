import { NextRequest, NextResponse } from 'next/server';
import { generateCode, setRoom, GameRoom, Question } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const { questions, timer, hostId } = await req.json();

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Questions required' }, { status: 400 });
    }

    const code = generateCode();
    const room: GameRoom = {
      code,
      status: 'waiting',
      questions: questions as Question[],
      currentQuestion: 0,
      timer: timer || 30,
      timerDefault: timer || 30,
      players: {},
      hostId: hostId || 'host',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setRoom(room);
    return NextResponse.json({ code });
  } catch (e: any) {
    console.error('Create room error:', e?.message || e);
    return NextResponse.json({ error: e?.message || 'Failed to create room' }, { status: 500 });
  }
}
