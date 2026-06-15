import { NextRequest, NextResponse } from 'next/server';
import { getRoom, setRoom } from '@/lib/redis';

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const room = await getRoom(code.toUpperCase());
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

  const { action } = await req.json();

  if (action === 'start') {
    room.status = 'question';
    room.currentQuestion = 0;
    room.timer = room.timerDefault;
    room.timerStart = Date.now();
  } else if (action === 'reveal') {
    room.status = 'revealing';
    // Award points
    const q = room.questions[room.currentQuestion];
    if (q) {
      const timeLeft = Math.max(0, room.timerDefault - Math.floor((Date.now() - (room.timerStart || Date.now())) / 1000));
      Object.values(room.players).forEach(player => {
        const answer = player.answers[q.id];
        if (answer === q.correct) {
          const bonus = Math.floor(timeLeft * (q.points / room.timerDefault));
          player.score += q.points + bonus;
        }
      });
    }
  } else if (action === 'next') {
    if (room.currentQuestion < room.questions.length - 1) {
      room.currentQuestion++;
      room.status = 'question';
      room.timer = room.timerDefault;
      room.timerStart = Date.now();
    } else {
      room.status = 'finished';
    }
  } else if (action === 'end') {
    room.status = 'finished';
  }

  await setRoom(room);
  return NextResponse.json({ success: true, room });
}
