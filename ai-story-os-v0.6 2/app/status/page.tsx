'use client';
import { useEffect, useState } from 'react';
type Health = { services?: { openai?: string; supabase?: string; mediaGeneration?:string; socialPublish?: string } };
export default function Status(){
  const [data,setData]=useState<Health|null>(null);
  useEffect(()=>{fetch('/api/health').then(r=>r.json()).then(setData)},[]);
  return <><div className="top"><div className="brand">接続状態</div></div><section className="card"><h1 className="title">SYSTEM</h1><div className="list"><div><b>OpenAI</b><br/><span className="sub">{data?.services?.openai||'確認中'}</span></div><div><b>Supabase</b><br/><span className="sub">{data?.services?.supabase||'確認中'}</span></div><div><b>Media</b><br/><span className="sub">{data?.services?.mediaGeneration||'確認中'}</span></div><div><b>SNS投稿</b><br/><span className="sub">{data?.services?.socialPublish||'確認中'}</span></div></div></section></>
}
