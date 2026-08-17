'use client';

import { useEffect, useState } from 'react';

type Metrics = { views:number; participation:number; shareRate:number; comments:number; saves:number; followerGrowth:number; verdict:string; worked:string; improve:string; next:string };

export default function Results(){
  const [m,setM]=useState<Metrics|null>(null);
  useEffect(()=>{fetch('/api/metrics').then(r=>r.json()).then(j=>setM(j.data));},[]);
  return <>
    <div className="top"><div className="brand">結果</div><span className="pill">EP 008</span></div>
    <section className="card"><div className="eyebrow">総合</div><h1 className="title">{m?.verdict || '集計中'}</h1><div className="metric-row"><div className="metric"><b>{m?m.views.toLocaleString():'-'}</b><span>再生</span></div><div className="metric"><b>{m?`${m.participation}%`:'-'}</b><span>参加率</span></div><div className="metric"><b>{m?`${m.shareRate}%`:'-'}</b><span>シェア率</span></div></div></section>
    <section className="card"><h3>反応</h3><div className="metric-row"><div className="metric"><b>{m?.comments ?? '-'}</b><span>コメント</span></div><div className="metric"><b>{m?.saves ?? '-'}</b><span>保存</span></div><div className="metric"><b>{m?`+${m.followerGrowth}`:'-'}</b><span>フォロー</span></div></div></section>
    <section className="card"><h3>AIの判断</h3><div className="list"><div><b>良かった</b><br/><span className="sub">{m?.worked || '分析中'}</span></div><div><b>改善</b><br/><span className="sub">{m?.improve || '分析中'}</span></div><div><b>次回</b><br/><span className="sub">{m?.next || '分析中'}</span></div></div></section>
  </>;
}
