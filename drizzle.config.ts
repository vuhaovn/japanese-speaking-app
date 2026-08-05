import { defineConfig } from 'drizzle-kit'
import { loadEnvConfig } from '@next/env'

// drizzle-kit cli không tự load .env.local như Next.js dev server — cần load thủ công
loadEnvConfig(process.cwd())

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
