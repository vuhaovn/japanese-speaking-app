'use server'

import { db } from '@/lib/db'
import { practice_sessions } from '@/lib/db/schema'
import { and, eq, gte } from 'drizzle-orm'

export async function logSession(data: {
  sessionKey: string
  sentenceId: number
  mode: 'shadow' | 'repeat'
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
