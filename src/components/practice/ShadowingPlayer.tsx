'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { getSentencesByMethod } from '@/data/sentences'
import { speak, stopSpeech, isSpeechAvailable } from '@/lib/speech/tts'
import SentenceCard from './SentenceCard'

const SENTENCES = getSentencesByMethod('shadow')
const LOOP_DELAY_MS = 2000

export default function ShadowingPlayer() {
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  // null = checking, true/false = known
  const [ttsAvailable, setTtsAvailable] = useState<boolean | null>(null)

  const isLoopingRef = useRef(false)
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentIndexRef = useRef(0)

  isLoopingRef.current = isLooping
  currentIndexRef.current = index

  useEffect(() => {
    setTtsAvailable(isSpeechAvailable())
    return () => {
      stopSpeech()
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current)
    }
  }, [])

  const clearLoopTimer = () => {
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current)
      loopTimerRef.current = null
    }
  }

  const playIndex = useCallback((i: number) => {
    setIsPlaying(true)
    speak(SENTENCES[i].jp, {
      onEnd: () => {
        setIsPlaying(false)
        if (isLoopingRef.current) {
          loopTimerRef.current = setTimeout(() => {
            playIndex(currentIndexRef.current)
          }, LOOP_DELAY_MS)
        }
      },
    })
  }, [])

  const handlePlay = () => {
    if (isPlaying) {
      stopSpeech()
      clearLoopTimer()
      setIsPlaying(false)
    } else {
      playIndex(index)
    }
  }

  const handlePrev = () => {
    stopSpeech()
    clearLoopTimer()
    setIsPlaying(false)
    setIndex((i) => (i - 1 + SENTENCES.length) % SENTENCES.length)
  }

  const handleNext = () => {
    stopSpeech()
    clearLoopTimer()
    setIsPlaying(false)
    setIndex((i) => (i + 1) % SENTENCES.length)
  }

  const toggleLoop = () => {
    setIsLooping((prev) => {
      const next = !prev
      isLoopingRef.current = next
      if (!next) clearLoopTimer()
      return next
    })
  }

  if (ttsAvailable === null) {
    return <div className="h-64 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
  }

  if (!ttsAvailable) {
    return (
      <div className="p-5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-sm">
        Trình duyệt của bạn không hỗ trợ Text-to-Speech. Vui lòng dùng Chrome hoặc Edge.
      </div>
    )
  }

  const sentence = SENTENCES[index]

  return (
    <div className="flex flex-col gap-8">
      <div className="text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3 leading-relaxed">
        Nhấn phát, rồi nói theo <strong>ngay lập tức</strong> — bám nhịp, bám tốc độ, không cần dịch.
      </div>

      <SentenceCard sentence={sentence} currentIndex={index} total={SENTENCES.length} />

      {isPlaying && (
        <p className="text-center text-sm text-indigo-500 dark:text-indigo-400 animate-pulse">
          Đang phát — hãy nói theo ngay bây giờ!
        </p>
      )}

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrev}
          className="w-11 h-11 flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-lg"
          aria-label="Câu trước"
        >
          ←
        </button>

        <button
          onClick={handlePlay}
          className={`px-8 py-3 rounded-full font-semibold text-white transition-all shadow-sm ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isPlaying ? 'Dừng' : 'Phát âm mẫu'}
        </button>

        <button
          onClick={handleNext}
          className="w-11 h-11 flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-lg"
          aria-label="Câu tiếp theo"
        >
          →
        </button>
      </div>

      <div className="flex justify-center">
        <button
          onClick={toggleLoop}
          className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
            isLooping
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400'
          }`}
        >
          ↺ {isLooping ? 'Đang lặp lại' : 'Lặp lại'}
        </button>
      </div>
    </div>
  )
}
