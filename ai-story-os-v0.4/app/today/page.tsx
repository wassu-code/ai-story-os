'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BranchCode, StoryProposal } from '@/types/story';

type RuntimeState = { episodeNumber:number; status:string; previousSummary?:string; mode?:string };

export default function Today() {
  const router = useRouter();
  const [proposal, setProposal] = useState<StoryProposal | null>(null);
  const [selected, setSelected] = useState<BranchCode | ''>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [mode, setMode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function boot() {
      try {
        const stateRes = await fetch('/api/state', { cache: 'no-store' });
        const stateJson = await stateRes.json();
        const state: RuntimeState = stateJson.data || { episodeNumber: 1, status: 'WAITING_DECISION' };
        const cacheKey = `storyProposal:${state.episodeNumber}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try { setProposal(JSON.parse(cached)); setMode(state.mode || ''); setLoading(false); return; } catch {}
        }
        const res = await fetch('/api/story/generate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ episodeNumber: state.episodeNumber, previousSummary: state.previousSummary })
        });
        if (!res.ok) throw new Error('候補生成に失敗しました');
        const json = await res.json();
        setProposal(json.data); setMode(json.mode || '');
        localStorage.setItem(cacheKey, JSON.stringify(json.data));
      } catch (e) {
        setError(e instanceof Error ? e.message : '読み込みに失敗しました');
      } finally { setLoading(false); }
    }
    boot();
  }, []);

  async function adopt() {
    if (!selected || !proposal) return;
    setGenerating(true); setError('');
    try {
      localStorage.setItem('selectedBranch', selected);
      const save = await fetch('/api/episode/select', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ episodeNumber: proposal.episodeNumber, code: selected }) });
      if (!save.ok) throw new Error('選択を保存できませんでした');
      const branch = proposal.branches.find(b => b.code === selected);
      const res = await fetch('/api/content/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeNumber: proposal.episodeNumber, previousSummary: proposal.previousSummary, selectedBranch: branch })
      });
      if (!res.ok) throw new Error('投稿生成に失敗しました');
      const json = await res.json();
      localStorage.setItem('generatedContent', JSON.stringify(json.data));
      localStorage.setItem('contentMode', json.mode || '');
      try {
        const mediaRes = await fetch('/api/media/start', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ imagePrompt:json.data.imagePrompt, videoPrompt:json.data.videoPrompt }) });
        const mediaJson = await mediaRes.json();
        localStorage.setItem('mediaState', JSON.stringify(mediaJson));
      } catch { localStorage.removeItem('mediaState'); }
      router.push('/review');
    } catch (e) {
      setError(e instanceof Error ? e.message : '処理に失敗しました');
    } finally { setGenerating(false); }
  }

  return <>
    <div className="top"><div className="brand">AI STORY</div><span className="pill">{proposal ? `EP ${String(proposal.episodeNumber).padStart(3,'0')}` : 'TODAY'}</span></div>
    <section className="card">
      <div className="eyebrow">YESTERDAY</div>
      <h1 className="title">◎ 強い</h1>
      <div className="metric-row"><div className="metric"><b>18,421</b><span>再生</span></div><div className="metric"><b>14.2%</b><span>参加率</span></div><div className="metric"><b>3.8%</b><span>シェア率</span></div></div>
    </section>
    <section className="card">
      <div className="eyebrow">TODAY</div><h2 className="title">次の展開を選ぶ</h2>
      {loading && <p className="sub">候補を準備しています…</p>}
      {error && <p className="notice">{error}</p>}
      {proposal && <>
        <p className="sub">前回：{proposal.previousSummary}</p>
        <div className="grid3">{proposal.branches.map(b => <button key={b.code} className={'choice '+(selected===b.code?'active':'')} onClick={() => setSelected(b.code)}><strong>{b.code}</strong><b>{b.title}</b><p className="sub">{b.description}</p><p className="sub">AI {b.aiScore} / 緊張度 {'★'.repeat(b.tension)}</p></button>)}</div>
        <div className="recommend"><b>AIおすすめ：{proposal.recommendation}</b><span>{proposal.recommendationReason}</span></div>
        {mode === 'fallback' && <p className="hint">現在はデモ生成。OPENAI_API_KEYを設定すると実AIへ切り替わります。</p>}
        <button className="cta" disabled={!selected || generating} onClick={adopt}>{generating ? '投稿を作成中…' : selected ? `${selected}を採用` : '1つ選んでください'}</button>
      </>}
    </section>
  </>;
}
