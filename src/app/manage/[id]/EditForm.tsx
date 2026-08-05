'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateSentence } from '@/app/actions'
import type { Sentence } from '@/lib/db/schema'

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--line)',
  borderRadius: 8,
  fontSize: 15,
  fontFamily: 'inherit',
  background: 'var(--surface)',
  color: 'var(--ink)',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--ink-soft)',
  marginBottom: 6,
}

export default function EditForm({ sentence }: { sentence: Sentence }) {
  const boundUpdate = updateSentence.bind(null, sentence.id)
  const [state, formAction, isPending] = useActionState(boundUpdate, { error: null, success: false })

  return (
    <>
      {state.success && (
        <div style={{
          background: 'var(--good-soft)',
          border: '1px solid var(--good)',
          borderRadius: 'var(--radius)',
          padding: '14px 16px',
          marginBottom: 20,
          color: 'var(--good)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <span>Đã cập nhật!</span>
          <Link href="/manage" className="btn" style={{ fontSize: 13, textDecoration: 'none' }}>
            ← Về danh sách
          </Link>
        </div>
      )}

      <div className="card">
        <form action={formAction}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div>
              <label style={labelStyle}>Câu tiếng Nhật *</label>
              <textarea
                name="jp"
                required
                rows={2}
                defaultValue={sentence.jp}
                style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.6, fontFamily: 'var(--jp-serif)', fontSize: 18 }}
              />
            </div>

            <div>
              <label style={labelStyle}>Cách đọc (kana)</label>
              <input
                type="text"
                name="kana"
                defaultValue={sentence.kana}
                style={{ ...fieldStyle, fontFamily: 'var(--jp-serif)' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Nghĩa tiếng Việt *</label>
              <input
                type="text"
                name="meaning_vi"
                required
                defaultValue={sentence.meaning_vi}
                style={fieldStyle}
              />
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Cấp độ</label>
                <select name="level" defaultValue={sentence.level} style={fieldStyle}>
                  <option value="N3">N3</option>
                  <option value="N2">N2</option>
                </select>
              </div>
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Điểm ngữ pháp (tuỳ chọn)</label>
                <input
                  type="text"
                  name="grammar_point"
                  defaultValue={sentence.grammar_point ?? ''}
                  placeholder="例：〜ていただく、〜ております"
                  style={fieldStyle}
                />
              </div>
            </div>

            {state.error && (
              <div style={{
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--accent)',
              }}>
                {state.error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isPending}
                style={{ minWidth: 120 }}
              >
                {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <Link href="/manage" className="btn" style={{ textDecoration: 'none', fontSize: 14 }}>
                Huỷ
              </Link>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
