'use client';

import { useEffect, useState } from 'react';
import type { GeneratedContent } from '@/types/story';

type MediaState = { enabled?:boolean; imageDataUrl?:string|null; imageWarning?:string|null; video?:{id:string;status:string;progress?:number}|null; videoWarning?:string|null };

export default function Review() {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [media, setMedia] = useState<MediaState | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('generatedContent');
    const savedMedia = localStorage.getItem('mediaState');
    if (saved) { try { setContent(JSON.parse(saved)); } catch {} }
    if (savedMedia) { try { setMedia(JSON.parse(savedMedia)); } catch {} }
  }, []);

  useEffect(() => {
    const id = media?.video?.id;
    const status = media?.video?.status;
    if (!id || !['queued','in_progress'].includes(status || '')) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/media/video/status?id=${encodeURIComponent(id)}`, { cache:'no-store' });
        const json = await res.json();
        if (json.ok) {
          setMedia(prev => {
            const next = { ...(prev || {}), video: json.video };
            localStorage.setItem('mediaState', JSON.stringify(next));
            return next;
          });
        }
      } catch {}
    }, 12000);
    return () => clearInterval(timer);
  }, [media?.video?.id, media?.video?.status]);

  async function regenerate() {
    if (!content) return;
    setMessage('再生成しています…');
    const selectedBranch = localStorage.getItem('selectedBranch');
    const res = await fetch('/api/content/generate', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ episodeNumber: content.episodeNumber, selectedBranch, regenerate: true }) });
    const json = await res.json();
    setContent(json.data); localStorage.setItem('generatedContent', JSON.stringify(json.data));
    try {
      const mediaRes = await fetch('/api/media/start', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ imagePrompt:json.data.imagePrompt, videoPrompt:json.data.videoPrompt }) });
      const mediaJson = await mediaRes.json(); setMedia(mediaJson); localStorage.setItem('mediaState', JSON.stringify(mediaJson));
    } catch {}
    setMessage('作り直しました。');
  }

  async function publish() {
    setPublishing(true); setMessage('');
    const res = await fetch('/api/publish', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ episodeNumber: content?.episodeNumber, videoId:media?.video?.id }) });
    const json = await res.json();
    setMessage(json.message || '承認しました。');
    localStorage.setItem('publishState', JSON.stringify(json));
    setPublishing(false);
  }

  if (!content) return <><div className="top"><div className="brand">投稿確認</div></div><section className="card"><h1 className="title">まだ投稿がありません</h1><p className="sub">「今日」から次の展開を選んでください。</p></section></>;

  const videoReady = media?.video?.status === 'completed';
  return <>
    <div className="top"><div className="brand">投稿確認</div><span className="status">READY</span></div>
    <section className="card">
      <div className="eyebrow">EPISODE {String(content.episodeNumber).padStart(3,'0')}</div>
      {videoReady && media?.video?.id ? <video className="video" controls playsInline src={`/api/media/video/content?id=${encodeURIComponent(media.video.id)}`} /> : media?.imageDataUrl ? <img className="video" src={media.imageDataUrl} alt="生成プレビュー" style={{objectFit:'cover'}} /> : <div className="video"><div><b>MEDIA PREVIEW</b><br/><small>{media?.enabled === false ? 'メディア生成OFF' : media?.video?.status ? `動画 ${media.video.status} ${media.video.progress ?? 0}%` : '生成アダプター待ち'}</small></div></div>}
      {media?.video && !videoReady && <p className="hint">動画：{media.video.status} {media.video.progress ?? 0}%（自動更新）</p>}
      {(media?.imageWarning || media?.videoWarning) && <p className="notice">{media.imageWarning || media.videoWarning}</p>}
      <h2>{content.hook}</h2><p className="sub">{content.script}</p>
      <div className="inner-card"><b>次どうする？</b><p>A {content.choiceA}<br/>B {content.choiceB}</p></div>
      <div className="caption-box"><span>CAPTION</span><p>{content.caption}</p></div>
      <p className="sub">Instagram ○　TikTok ○ <small>（本番投稿は安全設定OFF）</small></p>
      {message && <p className="notice">{message}</p>}
      <div className="row"><button className="secondary" onClick={regenerate}>作り直す</button><button className="cta" disabled={publishing} onClick={publish}>{publishing ? '承認中…' : '公開を承認'}</button></div>
    </section>
  </>;
}
