import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    data: {
      views: 18421,
      participation: 14.2,
      shareRate: 3.8,
      comments: 218,
      saves: 61,
      followerGrowth: 43,
      verdict: '◎ 強い',
      worked: '自分自身に関係する異常が強い',
      improve: '冒頭を1秒短くする',
      next: '不気味さを維持'
    },
    mode: 'fallback'
  });
}
