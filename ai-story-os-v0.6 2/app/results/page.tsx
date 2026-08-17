'use client';
import {useEffect,useMemo,useState} from 'react';
type M={days:number;views:number;votes:number;shares:number;saves:number;comments:number;returningVotes:number;totalVoters:number;profileVisits:number;linkClicks:number;freeJoins:number;paid:number};
type D={stage:string;label:string;action:string;reason:string;voteRate:number;returnRate:number;profileRate:number;linkRate:number};
const empty:M={days:0,views:0,votes:0,shares:0,saves:0,comments:0,returningVotes:0,totalVoters:0,profileVisits:0,linkClicks:0,freeJoins:0,paid:0};
export default function Results(){const[m,setM]=useState<M>(empty);const[d,setD]=useState<D|null>(null);const[saved,setSaved]=useState('');
 useEffect(()=>{const x=localStorage.getItem('dailyMetrics');if(x)try{setM({...empty,...JSON.parse(x)});}catch{}},[]);
 async function analyze(next：M){const j=await fetch('/api/monetization',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)}).then(r=>r.json());setD(j.data)}
 useEffect(()=>{analyze(m)},[m.days,m.views,m.votes,m.returningVotes,m.totalVoters,m.profileVisits,m.linkClicks,m.freeJoins,m.paid]);
 const fields:[keyof M,string][]=[['days','運用日数'],['views','再生'],['votes','投票'],['returningVotes','再参加者'],['totalVoters','計測した投票者'],['profileVisits','プロフィール訪問'],['linkClicks','リンククリック'],['freeJoins','無料参加'],['paid','購入']];
 function save(){localStorage.setItem('dailyMetrics',JSON.stringify(m));setSaved('保存しました。次のネタ生成時の判断材料になります。');analyze(m)}
 return <><div className="top"><div className="brand">結果</div><span className="pill">v0.6</span></div>
 <section className="card"><div className="eyebrow">MONETIZATION GATE</div><h1 className="title">{d?.label||'判定中'}</h1><div className="focus-box"><b>今日やること：{d?.action||'集計する'}</b><p className="sub">{d?.reason}</p></div><div className="metric-row"><div className="metric"><b>{d?.voteRate??0}%</b><span>投票率</span></div><div className="metric"><b>{d?.returnRate??0}%</b><span>再参加率</span></div><div className="metric"><b>{d?.profileRate??0}%</b><span>プロフィール率</span></div></div></section>
 <section className="card"><div className="eyebrow">実データ入力</div><h2>投稿後に数字だけ入れる</h2><p className="sub">未計測は0のままでOK。架空データで収益化判定しません。</p><div className="input-grid">{fields.map(([k,l])=><label key={k}><span>{l}</span><input inputMode="numeric" type="number" min="0" value={m[k]} onChange={e=>setM({...m,[k]:Math.max(0,Number(e.target.value))})}/></label>)}</div><button className="cta" onClick={save}>結果を保存して判定</button>{saved&&<p className="notice">{saved}</p>}</section>
 <section className="card"><div className="eyebrow">FUNNEL</div><div className="funnel"><span>VIEW</span><b>→</b><span>VOTE</span><b>→</b><span>RETURN</span><b>→</b><span>PROFILE</span><b>→</b><span>LINK</span><b>→</b><span>PAID</span></div><p className="sub">段階を飛ばしません。反応が弱い段階では販売を自動的に止めます。</p></section></>}
