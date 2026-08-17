import {NextResponse} from 'next/server';
import {getOpenAI} from '@/lib/openai';
export async function POST(req:Request){
 const input=await req.json(); const client=getOpenAI();
 if(!client)return NextResponse.json({mode:'mock',branches:[{code:'A',title:'今日の服を決めてもらう',score:87},{code:'B',title:'仕事帰りを決めてもらう',score:94},{code:'C',title:'今日の夕食を決めてもらう',score:86}]});
 const r=await client.responses.create({model:'gpt-5-mini',input:`あなたは日常参加型AIキャラクターのStory Engine。運営者向けに次の投稿テーマをA/B/Cの3案で短く提案。各案は視聴者向けの簡単な二択へ変換でき、昨日の結果を今日に反映し、今日の結果が明日へつながること。ホラーや大事件は禁止。現在状態:${JSON.stringify(input)}`});
 return NextResponse.json({mode:'live',text:r.output_text});
}
