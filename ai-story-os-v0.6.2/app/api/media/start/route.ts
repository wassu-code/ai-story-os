import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (process.env.ENABLE_MEDIA_GENERATION !== 'true') {
    return NextResponse.json({ enabled:false, mode:'disabled', message:'メディア生成は安全設定でOFFです。' });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ enabled:false, mode:'demo', message:'OPENAI_API_KEYが未設定です。' });

  const imagePrompt = String(body.imagePrompt || '');
  const videoPrompt = String(body.videoPrompt || '');
  if (!imagePrompt || !videoPrompt) return NextResponse.json({ enabled:true, ok:false, message:'生成プロンプトがありません。' }, { status:400 });

  const headers = { Authorization: `Bearer ${apiKey}` };
  let imageDataUrl: string | null = null;
  let imageWarning: string | null = null;
  try {
    const imageRes = await fetch('https://api.openai.com/v1/images/generations', {
      method:'POST',
      headers:{ ...headers, 'Content-Type':'application/json' },
      body:JSON.stringify({ model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2', prompt:imagePrompt, size:'1024x1536', quality:'low' })
    });
    const imageJson = await imageRes.json();
    if (!imageRes.ok) throw new Error(imageJson?.error?.message || '画像生成に失敗しました');
    const b64 = imageJson?.data?.[0]?.b64_json;
    if (b64) imageDataUrl = `data:image/png;base64,${b64}`;
  } catch (e) {
    imageWarning = e instanceof Error ? e.message : '画像生成に失敗しました';
  }

  let video: any = null;
  let videoWarning: string | null = null;
  try {
    const form = new FormData();
    form.append('model', process.env.OPENAI_VIDEO_MODEL || 'sora-2-pro');
    form.append('prompt', videoPrompt);
    form.append('size', process.env.OPENAI_VIDEO_SIZE || '1080x1920');
    form.append('seconds', process.env.OPENAI_VIDEO_SECONDS || '16');
    const videoRes = await fetch('https://api.openai.com/v1/videos', { method:'POST', headers, body:form });
    const videoJson = await videoRes.json();
    if (!videoRes.ok) throw new Error(videoJson?.error?.message || '動画生成を開始できませんでした');
    video = { id: videoJson.id, status: videoJson.status, progress: videoJson.progress ?? 0 };
  } catch (e) {
    videoWarning = e instanceof Error ? e.message : '動画生成を開始できませんでした';
  }

  return NextResponse.json({ enabled:true, ok:Boolean(imageDataUrl || video), imageDataUrl, imageWarning, video, videoWarning });
}
