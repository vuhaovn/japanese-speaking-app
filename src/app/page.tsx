export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { sentences } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import PracticeApp from '@/components/practice/PracticeApp'

export default async function Home() {
  const data = await db.select().from(sentences).orderBy(asc(sentences.id))
  return <PracticeApp initialSentences={data} />
}
