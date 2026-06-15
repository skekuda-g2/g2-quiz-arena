import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  const relevantKeys = Object.keys(process.env).filter(k => 
    k.includes('KV') || k.includes('UPSTASH') || k.includes('REDIS') || k.includes('STORAGE')
  );
  
  // Test Redis connection
  let redisTest = 'unknown';
  let redisError = '';
  try {
    await redis.set('test-connection', 'ok', { ex: 60 });
    const val = await redis.get('test-connection');
    redisTest = val === 'ok' ? 'SUCCESS' : `unexpected value: ${val}`;
  } catch (e: any) {
    redisTest = 'FAILED';
    redisError = e?.message || String(e);
  }

  return NextResponse.json({ 
    envKeys: relevantKeys,
    url: process.env.KV_REST_API_URL?.substring(0, 30) + '...',
    hasToken: !!(process.env.KV_REST_API_TOKEN),
    redisTest,
    redisError,
  });
}
