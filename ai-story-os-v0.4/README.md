# AI STORY OS v0.3

「選ぶ → 確認 → 結果」の3操作に限定した参加型AIショートストーリー運用OS。

## v0.3で追加したもの
- OpenAI未設定時も動くデモ/フォールバックモード。
- Supabase設定時はEpisode、3案、選択、生成コンテンツ、状態をDBへ保存。
- `/api/health` と `/status` で接続状態を確認。
- SNS投稿は安全スイッチ `ENABLE_SOCIAL_PUBLISH=false` を初期値とし、誤投稿しない。
- DB障害時もローカルUIを止めずに継続。

## 起動
1. `.env.example` を `.env.local` にコピー。
2. Supabaseを使う場合は `supabase/schema.sql` を実行。
3. OpenAI APIキーを設定するとStory/Content生成が実AIへ切り替わる。
4. `npm install`
5. `npm run dev`

この作業環境ではnpmレジストリ接続がタイムアウトしたため、ここでは依存インストール/Next buildのみ未実行です。

## 画面
- `/today` 次の展開を選ぶ
- `/review` 完成投稿を確認
- `/results` 結果を見る
- `/settings` 最小設定
- `/status` 接続状態（通常運用では不要）

## v0.3の完成範囲
`結果 → 3案 → 選択 → AI生成 → DB保存 → 承認` の実接続準備まで。
Instagram/TikTokの本番投稿と実動画生成は資格情報/API審査が必要なのでadapter boundaryで停止しています。

## Media generation
`ENABLE_MEDIA_GENERATION=true` にすると、展開採用後に自動で画像と動画ジョブを開始します。
- Image: `gpt-image-2` / portrait preview
- Video: `sora-2-pro` / 1080x1920 / 16s (envで変更可)
- Review画面は12秒間隔で動画状態を確認し、完成後はMP4を直接プレビューします。

API使用料が発生するため初期値はOFFです。

## v0.4 Standalone runtime
`standalone.html` は依存パッケージ不要でブラウザだけで動きます。
- A/B/C選択
- Episode状態保存（localStorage）
- 投稿確認
- 再生成デモ
- 公開
- 結果生成
- 次Episodeへの進行

Next.js/Supabase/OpenAIの本番接続が完了する前でもUXを一周検証できます。
