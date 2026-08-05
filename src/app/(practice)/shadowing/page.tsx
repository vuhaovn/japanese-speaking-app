import type { Metadata } from 'next'
import Link from 'next/link'
import ShadowingPlayer from '@/components/practice/ShadowingPlayer'

export const metadata: Metadata = {
  title: 'Shadowing | 日本語練習',
}

export default function ShadowingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-900">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-neutral-500 dark:text-neutral-400 hover:underline"
          >
            ← Về trang chủ
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Shadowing</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Nghe và lặp lại tức thì — bám nhịp, bám ngữ điệu. Đừng dừng để dịch.
          </p>
        </div>

        <ShadowingPlayer />
      </div>
    </main>
  )
}
