import { pgTable, serial, text, varchar, integer, jsonb, timestamp } from 'drizzle-orm/pg-core'

// Câu luyện tập — sẽ migrate từ static data sang DB ở Giai đoạn 2
export const sentences = pgTable('sentences', {
  id: serial('id').primaryKey(),
  jp: text('jp').notNull(),
  kana: text('kana').notNull(),
  meaning_vi: text('meaning_vi').notNull(),
  level: varchar('level', { length: 2 }).notNull(),           // 'N3' | 'N2'
  method: text('method').array().notNull(),                   // ['shadow', 'repeat']
  // pitch: null = chưa có dữ liệu thật (hiển thị tag "demo" trên UI)
  pitch: jsonb('pitch').$type<('H' | 'L')[]>(),
  grammar_point: text('grammar_point'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

// Lịch sử luyện tập — dùng session_key (UUID lưu trong localStorage) thay vì auth
export const practice_sessions = pgTable('practice_sessions', {
  id: serial('id').primaryKey(),
  // UUID sinh phía client, lưu vào localStorage để track progress không cần đăng nhập
  session_key: varchar('session_key', { length: 64 }).notNull(),
  sentence_id: integer('sentence_id')
    .notNull()
    .references(() => sentences.id, { onDelete: 'cascade' }),
  mode: varchar('mode', { length: 20 }).notNull(),            // 'shadow' | 'repeat'
  // match_score: % khớp văn bản từ Levenshtein — null nếu không dùng SpeechRecognition
  match_score: integer('match_score'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export type Sentence = typeof sentences.$inferSelect
export type NewSentence = typeof sentences.$inferInsert
export type PracticeSession = typeof practice_sessions.$inferSelect
export type NewPracticeSession = typeof practice_sessions.$inferInsert
