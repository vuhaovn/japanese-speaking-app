import { db } from '@/lib/db'
import { sentences } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import Link from 'next/link'
import DeleteButton from './DeleteButton'

export const dynamic = 'force-dynamic'

export default async function ManagePage() {
  const data = await db.select().from(sentences).orderBy(asc(sentences.id))

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px 64px' }}>
      <header style={{ marginBottom: 20 }}>
        <Link href="/" style={{ fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>
          ← Quay về luyện tập
        </Link>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 10 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
            Quản lý câu luyện
            <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--ink-soft)', marginLeft: 10 }}>
              {data.length} câu
            </span>
          </h1>
          <Link href="/add" className="btn btn-primary" style={{ fontSize: 13, textDecoration: 'none' }}>
            + Thêm câu
          </Link>
        </div>
      </header>

      {data.length === 0 ? (
        <div className="card" style={{ color: 'var(--ink-soft)', textAlign: 'center' }}>
          Chưa có câu nào. <Link href="/add">Thêm câu đầu tiên →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.map((s, i) => (
            <div
              key={s.id}
              className="card"
              style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <span style={{ fontSize: 13, color: 'var(--ink-soft)', minWidth: 28 }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--jp-serif)', fontSize: 17, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.jp}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.meaning_vi}
                  {s.grammar_point && (
                    <span style={{ marginLeft: 8, fontSize: 11, background: 'var(--good-soft)', color: 'var(--good)', padding: '1px 6px', borderRadius: 4 }}>
                      {s.grammar_point}
                    </span>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 600, flexShrink: 0 }}>
                {s.level}
              </span>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <Link href={`/manage/${s.id}`} className="btn" style={{ fontSize: 13, textDecoration: 'none' }}>
                  Sửa
                </Link>
                <DeleteButton id={s.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
