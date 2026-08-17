# Automation v0.2

## User-visible loop
1. 今日: 3案から選ぶ
2. 投稿: 生成物を確認して承認
3. 結果: KPIとAI要約を見る

## Server loop
- POST /api/story/generate
  - OpenAI Responses API + Structured Outputs
  - missing key / failure => fallback
- POST /api/content/generate
  - selected branch => hook/script/A-B/caption/media prompts
- POST /api/episode/select
  - Supabase configured => episode status + selected branch persistence
- POST /api/publish
  - v0.2: APPROVEDまで。SNS adapter is intentionally gated.
- GET /api/metrics
  - v0.2: fallback metrics. SNS insight adapters replace this later.

## Next automation phase
1. Supabase seed + project bootstrap
2. Image provider adapter
3. Video provider adapter
4. Instagram publishing adapter
5. TikTok publishing adapter
6. Metrics collector
7. Make scheduled orchestration
