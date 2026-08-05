'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { addSentence } from '@/app/actions'

const initialState = { error: null as string | null, success: false }

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

export default function AddPage() {
  const [state, formAction, isPending] = useActionState(addSentence, initialState)
  const [formKey, setFormKey] = useState(0)

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 64px' }}>
      <header style={{ marginBottom: 20 }}>
        <Link href="/" style={{ fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>
          ← Quay về luyện tập
        </Link>
        <h1 style={{ marginTop: 10, marginBottom: 4, fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>
          Thêm câu luyện
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>
          Câu mới sẽ xuất hiện ngay trong danh sách luyện tập.
        </p>
      </header>

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
          flexWrap: 'wrap',
        }}>
          <span>Đã thêm câu thành công!</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn"
              style={{ fontSize: 13 }}
              onClick={() => { setFormKey(k => k + 1) }}
            >
              + Thêm câu nữa
            </button>
            <Link href="/" className="btn btn-primary" style={{ fontSize: 13, textDecoration: 'none' }}>
              Về luyện tập →
            </Link>
          </div>
        </div>
      )}

      <div className="card">
        <form key={formKey} action={formAction}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div>
              <label style={labelStyle}>Câu tiếng Nhật *</label>
              <textarea
                name="jp"
                required
                rows={2}
                placeholder="例：部長、先ほどご連絡いただきありがとうございます。"
                style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.6, fontFamily: 'var(--jp-serif)', fontSize: 18 }}
              />
            </div>

            <div>
              <label style={labelStyle}>Cách đọc (kana)</label>
              <input
                type="text"
                name="kana"
                placeholder="例：ぶちょう、さきほどごれんらくいただきありがとうございます。"
                style={{ ...fieldStyle, fontFamily: 'var(--jp-serif)' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Nghĩa tiếng Việt *</label>
              <input
                type="text"
                name="meaning_vi"
                required
                placeholder="例：Trưởng phòng, cảm ơn anh đã liên hệ lúc nãy."
                style={fieldStyle}
              />
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Cấp độ</label>
                <select name="level" style={fieldStyle}>
                  <option value="N3">N3</option>
                  <option value="N2">N2</option>
                </select>
              </div>
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Điểm ngữ pháp (tuỳ chọn)</label>
                <input
                  type="text"
                  name="grammar_point"
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending}
              style={{ alignSelf: 'flex-start', minWidth: 120 }}
            >
              {isPending ? 'Đang lưu...' : '+ Thêm câu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
