import { NextResponse } from 'next/server';

type M={views?:number;votes?:number;shares?:number;profileVisits?:number;linkClicks?:number;freeJoins?:number;paid?:number;returningVotes?:number;totalVoters?:number;days?:number};
export async function POST(req:Request){
 const m:M=await req.json().catch(()=>({}));
 const views=Math.max(0,Number(m.views||0)), votes=Math.max(0,Number(m.votes||0));
 const voteRate=views?votes/views*100:0; const returnRate=m.totalVoters?Number(m.returningVotes||0)/Number(m.totalVoters)*100:0;
 const profileRate=views?Number(m.profileVisits||0)/views*100:0; const linkRate=Number(m.profileVisits||0)?Number(m.linkClicks||0)/Number(m.profileVisits||0)*100:0;
 let stage='validate', label='検証継続', action='まず7日分の参加データを集める', reason='販売より先に、知らない人が二択へ参加するか確認します。';
 if(Number(m.days||0)>=7 && voteRate>=3){stage='retention';label='再参加を強化';action='翌日の結果回収を強くする';reason='参加は確認できました。次は同じ人が戻る理由を作ります。';}
 if(Number(m.days||0)>=10 && voteRate>=4 && returnRate>=15){stage='cta_test';label='プロフィール導線テスト';action='「もっと参加する」CTAを1つだけ設置';reason='参加と再参加が確認できたため、外部導線への意欲を測れます。';}
 if(Number(m.linkClicks||0)>=30 && Number(m.freeJoins||0)>=5){stage='paid_test';label='小額課金テスト';action='7日限定の深い参加企画を1つだけ販売';reason='外部遷移と無料参加が確認できたため、支払意思を小さく検証します。';}
 if(Number(m.paid||0)>=5){stage='membership';label='継続課金を検証';action='売れた体験だけ月額プラン化';reason='実購入が確認できたため、同じ価値の継続需要を測ります。';}
 return NextResponse.json({data:{stage,label,action,reason,voteRate:+voteRate.toFixed(1),returnRate:+returnRate.toFixed(1),profileRate:+profileRate.toFixed(1),linkRate:+linkRate.toFixed(1)}});
}
