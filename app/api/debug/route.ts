import { NextResponse } from 'next/server';

export async function GET() {
  const relevantKeys = Object.keys(process.env).filter(k => 
    k.includes('KV') || k.includes('UPSTASH') || k.includes('REDIS') || k.includes('STORAGE')
  );
  return NextResponse.json({ 
    envKeys: relevantKeys,
    hasUrl: !!(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL),
    hasToken: !!(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN),
  });
}
