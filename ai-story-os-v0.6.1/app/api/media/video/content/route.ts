export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return new Response('video id required', { status:400 });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return new Response('OPENAI_API_KEY missing', { status:400 });
  const res = await fetch(`https://api.openai.com/v1/videos/${encodeURIComponent(id)}/content`, { headers:{ Authorization:`Bearer ${key}` }, cache:'no-store' });
  if (!res.ok || !res.body) return new Response('video not ready', { status:res.status || 502 });
  return new Response(res.body, { status:200, headers:{ 'Content-Type': res.headers.get('content-type') || 'video/mp4', 'Cache-Control':'private, max-age=300' } });
}
