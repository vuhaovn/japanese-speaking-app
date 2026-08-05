'use client'

import { useState, useRef, useEffect } from 'react'
import { getSentencesByMethod } from '@/data/sentences'
import { speak, stopSpeech, isSpeechAvailable } from '@/lib/speech/tts'
import { startRecording, isRecordingSupported, type RecordingSession } from '@/lib/speech/recorder'
import SentenceCard from './SentenceCard'

const SENTENCES = getSentencesByMethod('repeat')

type Phase = 'idle' | 'speaking' | 'ready' | 'recording' | 'done'

export default function RepeatPlayer() {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const [isPlayingBack, setIsPlayingBack] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const [ttsAvailable, setTtsAvailable] = useState<boolean | null>(null)
  const [micAvailable, setMicAvailable] = useState(false)

  const sessionRef = useRef<RecordingSession | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevUrlRef = useRef<string | null>(null)

  useEffect(() => {
    setTtsAvailable(isSpeechAvailable())
    setMicAvailable(isRecordingSupported())
    return () => {
      stopSpeech()
      if (sessionRef.current) sessionRef.current.stop().then((url) => URL.revokeObjectURL(url))
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

  // Revoke previous blob URL when recordingUrl changes
  useEffect(() => {
    const prev = prevUrlRef.current
    prevUrlRef.current = recordingUrl
    if (prev) URL.revokeObjectURL(prev)
  }, [recordingUrl])

  const resetForNewSentence = () => {
    stopSpeech()
    if (sessionRef.current) {
      sessionRef.current.stop().then((url) => URL.revokeObjectURL(url))
      sessionRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setRecordingUrl(null)
    setPhase('idle')
    setMicError(null)
    setIsPlayingBack(false)
  }

  const handleListen = () => {
    if (!ttsAvailable) return
    setPhase('speaking')
    setRecordingUrl(null)
    speak(SENTENCES[index].jp, { onEnd: () => setPhase('ready') })
  }

  const handleStartRecording = async () => {
    setMicError(null)
    try {
      sessionRef.current = await startRecording()
      setPhase('recording')
    } catch (err) {
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setMicError('Bạn đã từ chối quyền microphone. Hãy cấp quyền trong cài đặt trình duyệt.')
      } else {
        setMicError('Không thể khởi động microphone. Hãy thử lại.')
      }
    }
  }

  const handleStopRecording = async () => {
    if (!sessionRef.current) return
    const url = await sessionRef.current.stop()
    sessionRef.current = null
    setRecordingUrl(url)
    setPhase('done')
  }

  const handlePlayback = () => {
    if (!recordingUrl) return
    if (audioRef.current) audioRef.current.pause()
    const audio = new Audio(recordingUrl)
    audioRef.current = audio
    setIsPlayingBack(true)
    audio.onended = () => setIsPlayingBack(false)
    audio.play()
  }

  const handleRetry = () => {
    setPhase('idle')
    setRecordingUrl(null)
    setMicError(null)
  }

  const handlePrev = () => {
    resetForNewSentence()
    setIndex((i) => (i - 1 + SENTENCES.length) % SENTENCES.length)
  }

  const handleNext = () => {
    resetForNewSentence()
    setIndex((i) => (i + 1) % SENTENCES.length)
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
        Nghe câu mẫu → cố nhớ → ghi âm lại → nghe lại giọng của bạn và so sánh.
      </div>

      <SentenceCard sentence={sentence} currentIndex={index} total={SENTENCES.length} />

      <div className="flex flex-col gap-4 items-center min-h-[120px] justify-center">
        {(phase === 'idle' || phase === 'speaking') && (
          <button
            onClick={handleListen}
            disabled={phase === 'speaking'}
            className="px-8 py-3 rounded-full font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {phase === 'speaking' ? '▶ Đang phát...' : '▶ Nghe mẫu'}
          </button>
        )}

        {phase === 'ready' && !micAvailable && (
          <p className="text-yellow-600 dark:text-yellow-400 text-sm text-center">
            Trình duyệt không hỗ trợ ghi âm. Hãy dùng Chrome hoặc Edge.
          </p>
        )}

        {phase === 'ready' && micAvailable && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-indigo-600 dark:text-indigo-400 font-semibold">Đến lượt bạn!</p>
            <button
              onClick={handleStartRecording}
              className="px-8 py-3 rounded-full font-semibold text-white bg-red-500 hover:bg-red-600 transition-all shadow-sm"
            >
              Ghi âm
            </button>
            <button
              onClick={handleListen}
              className="text-sm text-neutral-500 dark:text-neutral-400 hover:underline"
            >
              Nghe lại mẫu
            </button>
          </div>
        )}

        {phase === 'recording' && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-red-500 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              Đang ghi âm...
            </div>
            <button
              onClick={handleStopRecording}
              className="px-8 py-3 rounded-full font-semibold text-white bg-neutral-700 hover:bg-neutral-800 dark:bg-neutral-600 dark:hover:bg-neutral-500 transition-all shadow-sm"
            >
              Dừng
            </button>
          </div>
        )}

        {phase === 'done' && recordingUrl && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Ghi âm hoàn tất!</p>
            <button
              onClick={handlePlayback}
              disabled={isPlayingBack}
              className="px-8 py-3 rounded-full font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 transition-all shadow-sm"
            >
              {isPlayingBack ? '▶ Đang phát...' : '▶ Nghe lại giọng bạn'}
            </button>
            <div className="flex gap-4">
              <button
                onClick={handleRetry}
                className="text-sm text-neutral-500 dark:text-neutral-400 hover:underline"
              >
                Thử lại
              </button>
              <button
                onClick={handleListen}
                className="text-sm text-neutral-500 dark:text-neutral-400 hover:underline"
              >
                Nghe mẫu lại
              </button>
            </div>
          </div>
        )}

        {micError && (
          <p className="text-sm text-red-500 dark:text-red-400 text-center max-w-sm">
            {micError}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <button
          onClick={handlePrev}
          className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm transition-colors"
        >
          ← Câu trước
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm transition-colors"
        >
          Câu tiếp →
        </button>
      </div>
    </div>
  )
}
