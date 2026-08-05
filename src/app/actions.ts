'use server'

import { db } from '@/lib/db'
import { sentences, practice_sessions } from '@/lib/db/schema'
import { and, eq, gte } from 'drizzle-orm'

export async function updateSentence(
  id: number,
  _prev: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const jp = ((formData.get('jp') as string) ?? '').trim()
  const kana = ((formData.get('kana') as string) ?? '').trim() || jp
  const meaning_vi = ((formData.get('meaning_vi') as string) ?? '').trim()
  const level = ((formData.get('level') as string) ?? 'N3') as 'N3' | 'N2'
  const grammar_point = ((formData.get('grammar_point') as string) ?? '').trim() || null

  if (!jp || !meaning_vi) {
    return { error: 'Vui lòng điền đủ các trường bắt buộc (*).', success: false }
  }

  try {
    await db.update(sentences).set({ jp, kana, meaning_vi, level, grammar_point }).where(eq(sentences.id, id))
    return { error: null, success: true }
  } catch {
    return { error: 'Lỗi khi cập nhật. Thử lại sau.', success: false }
  }
}

export async function deleteSentence(id: number): Promise<void> {
  await db.delete(sentences).where(eq(sentences.id, id))
}

export async function addSentence(
  _prev: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const jp = ((formData.get('jp') as string) ?? '').trim()
  const kana = ((formData.get('kana') as string) ?? '').trim() || jp
  const meaning_vi = ((formData.get('meaning_vi') as string) ?? '').trim()
  const level = (((formData.get('level') as string) ?? 'N3')) as 'N3' | 'N2'
  const grammar_point = ((formData.get('grammar_point') as string) ?? '').trim() || null

  if (!jp || !kana || !meaning_vi) {
    return { error: 'Vui lòng điền đủ các trường bắt buộc (*).', success: false }
  }

  try {
    await db.insert(sentences).values({
      jp,
      kana,
      meaning_vi,
      level,
      method: ['shadow', 'repeat'],
      pitch: null,
      grammar_point,
    })
    return { error: null, success: true }
  } catch {
    return { error: 'Lỗi khi lưu vào database. Thử lại sau.', success: false }
  }
}

export async function logSession(data: {
  sessionKey: string
  sentenceId: number
  mode: 'shadow' | 'repeat' | 'pitch'
  matchScore?: number | null
}) {
  await db.insert(practice_sessions).values({
    session_key: data.sessionKey,
    sentence_id: data.sentenceId,
    mode: data.mode,
    match_score: data.matchScore ?? null,
  })
}

export async function getSessionProgress(
  sessionKey: string
): Promise<{ sentenceId: number }[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return db
    .selectDistinct({ sentenceId: practice_sessions.sentence_id })
    .from(practice_sessions)
    .where(
      and(
        eq(practice_sessions.session_key, sessionKey),
        gte(practice_sessions.created_at, today)
      )
    )
}
