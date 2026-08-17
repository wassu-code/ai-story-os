import { NextResponse } from 'next/server';
import { getRuntimeState } from '@/lib/store';

export async function GET() {
  try {
    return NextResponse.json({ data: await getRuntimeState() });
  } catch (error) {
    console.error('state failed', error);
    return NextResponse.json({ data: { mode: 'demo', status: 'WAITING_DECISION', episodeNumber: 9 }, warning: 'DBを読めないためデモ状態です。' });
  }
}
