import { NextResponse } from 'next/server';
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ ok:false, message:'video idがありません' }, { status:400 });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ ok:false, message:'OPENAI_API_KEYが未設定です' }, { status:400 });
  const res = await fetch(`https://api.openai.com/v1/videos/${encodeURIComponent(id)}`, { headers:{ Authorization:`Bearer ${key}` }, cache:'no-store' });
  const json = await res.json();
  if (!res.ok) return NextResponse.json({ ok:false, message:json?.error?.message || '動画状態を取得できません' }, { status:res.status });
  return NextResponse.json({ ok:true, video:{ id:json.id, status:json.status, progress:json.progress ?? 0, error:json.error ?? null } });
}
