import { db } from '@/lib/db'
import { sentences } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EditForm from './EditForm'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [sentence] = await db.select().from(sentences).where(eq(sentences.id, Number(id)))

  if (!sentence) notFound()

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 64px' }}>
      <header style={{ marginBottom: 20 }}>
        <Link href="/manage" style={{ fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>
          ← Quay về danh sách
        </Link>
        <h1 style={{ marginTop: 10, marginBottom: 4, fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>
          Sửa câu #{sentence.id}
        </h1>
      </header>
      <EditForm sentence={sentence} />
    </div>
  )
}
