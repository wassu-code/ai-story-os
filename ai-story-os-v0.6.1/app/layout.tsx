import './globals.css';
import Link from 'next/link';
export const metadata={title:'AI STORY OS',description:'Simple human-in-the-loop AI story operations'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ja"><body><main className="shell">{children}</main><nav className="nav"><Link href="/today">今日</Link><Link href="/review">投稿</Link><Link href="/results">結果</Link><Link href="/settings">設定</Link></nav></body></html>}
