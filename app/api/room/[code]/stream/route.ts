import { NextRequest } from 'next/server';
import { getRoom } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const encoder = new TextEncoder();
  let interval: NodeJS.Timeout;
  let lastUpdatedAt = 0;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      // Send initial state
      getRoom(code.toUpperCase()).then(room => {
        if (room) {
          send(room);
          lastUpdatedAt = room.updatedAt;
        }
      });

      // Poll every 1 second
      interval = setInterval(async () => {
        try {
          const room = await getRoom(code.toUpperCase());
          if (room && room.updatedAt > lastUpdatedAt) {
            send(room);
            lastUpdatedAt = room.updatedAt;
          }
          if (!room) {
            clearInterval(interval);
            controller.close();
          }
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);
    },
    cancel() {
      clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
