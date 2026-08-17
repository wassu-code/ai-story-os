import { NextResponse } from 'next/server';
import { selectBranch } from '@/lib/store';
import type { BranchCode } from '@/types/story';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const episodeNumber = Number(body.episodeNumber);
  const code = String(body.code || '') as BranchCode;
  if (!episodeNumber || !['A','B','C'].includes(code)) return NextResponse.json({ ok:false, message:'選択内容が不正です。' }, { status:400 });
  try {
    const saved = await selectBranch(episodeNumber, code);
    return NextResponse.json({ ok:true, ...saved });
  } catch (error) {
    console.error('select failed', error);
    return NextResponse.json({ ok:true, mode:'demo', warning:'DB保存できなかったためローカルで続行します。' });
  }
}
