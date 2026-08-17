import { NextResponse } from 'next/server';
import { approveEpisode } from '@/lib/store';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const episodeNumber = Number(body.episodeNumber);
  if (!episodeNumber) return NextResponse.json({ ok:false, message:'Episode番号がありません。' }, { status:400 });
  try { await approveEpisode(episodeNumber); } catch (error) { console.error('approve failed', error); }

  if (process.env.ENABLE_SOCIAL_PUBLISH !== 'true') {
    return NextResponse.json({ ok:true, published:false, message:'承認しました。本番投稿は安全設定でOFFです。' });
  }

  return NextResponse.json({ ok:true, published:false, message:'投稿アダプター接続待ちです。承認状態を保存しました。' });
}
