'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'jsa_session_key'

// Trả về UUID ổn định từ localStorage — dùng thay auth để track progress
export function useSessionKey(): string | null {
  const [key, setKey] = useState<string | null>(null)

  useEffect(() => {
    let stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      stored = crypto.randomUUID()
      localStorage.setItem(STORAGE_KEY, stored)
    }
    setKey(stored)
  }, [])

  return key
}
