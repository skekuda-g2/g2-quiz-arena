import { NextRequest, NextResponse } from 'next/server';
import { generateCode, setRoom, GameRoom, Question, redis } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questions, timer, hostId } = body;

    console.log('Create room request:', { questionCount: questions?.length, timer, hostId });

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Questions required' }, { status: 400 });
    }

    // Test Redis first
    try {
      await redis.set('ping', 'pong', { ex: 10 });
      const pong = await redis.get('ping');
      console.log('Redis ping:', pong);
    } catch (redisErr: any) {
      console.error('Redis connection failed:', redisErr?.message);
      return NextResponse.json({ error: `Redis error: ${redisErr?.message}` }, { status: 500 });
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
    console.log('Room created:', code);
    return NextResponse.json({ code });
  } catch (e: any) {
    console.error('Create room error:', e?.message, e?.stack);
    return NextResponse.json({ error: e?.message || 'Failed to create room' }, { status: 500 });
  }
}
