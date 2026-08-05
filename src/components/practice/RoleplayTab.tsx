'use client'

import { useState, useEffect, useRef } from 'react'
import { speak, stopSpeech } from '@/lib/speech/tts'
import { startRecording, isRecordingSupported, type RecordingSession } from '@/lib/speech/recorder'
import { SCENARIOS, type Scenario } from '@/data/roleplay-scenarios'

interface Props {
  rate: number
  voice: string
}

export default function RoleplayTab({ rate, voice }: Props) {
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [turnIdx, setTurnIdx] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [heardText, setHeardText] = useState<string | null>(null)
  const [showExample, setShowExample] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const [isPlayingBack, setIsPlayingBack] = useState(false)
  const [completed, setCompleted] = useState(false)

  const rateRef = useRef(rate)
  const voiceRef = useRef<string>(voice)
  rateRef.current = rate
  voiceRef.current = voice

  const sessionRef = useRef<RecordingSession | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      stopSpeech()
      if (sessionRef.current) sessionRef.current.stop().then(url => URL.revokeObjectURL(url))
      recognitionRef.current?.abort()
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

  useEffect(() => {
    const prev = prevUrlRef.current
    prevUrlRef.current = recordingUrl
    if (prev) URL.revokeObjectURL(prev)
  }, [recordingUrl])

  // Auto-play NPC lines when turn changes
  useEffect(() => {
    if (!scenario || completed) return
    const turn = scenario.turns[turnIdx]
    if (turn?.role !== 'npc') return

    setIsSpeaking(true)
    speak(turn.jp, {
      rate: rateRef.current,
      voice: voiceRef.current,
      onEnd: () => setIsSpeaking(false),
    })
    return () => {
      stopSpeech()
      setIsSpeaking(false)
    }
  }, [scenario, turnIdx, completed])

  const resetTurnState = () => {
    stopSpeech()
    if (sessionRef.current) {
      sessionRef.current.stop().then(url => URL.revokeObjectURL(url))
      sessionRef.current = null
    }
    if (recognitionRef.current) { recognitionRef.current.abort(); recognitionRef.current = null }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setIsRecording(false)
    setIsSpeaking(false)
    setIsPlayingBack(false)
    setHeardText(null)
    setShowExample(false)
    setRecordingUrl(null)
    setMicError(null)
  }

  const handleSelectScenario = (s: Scenario) => {
    resetTurnState()
    setScenario(s)
    setTurnIdx(0)
    setCompleted(false)
  }

  const handleBack = () => {
    resetTurnState()
    setScenario(null)
    setCompleted(false)
  }

  const handleNext = () => {
    if (!scenario) return
    resetTurnState()
    const next = turnIdx + 1
    if (next >= scenario.turns.length) {
      setCompleted(true)
    } else {
      setTurnIdx(next)
    }
  }

  const handleReplayNPC = () => {
    if (!scenario) return
    const turn = scenario.turns[turnIdx]
    if (turn.role !== 'npc') return
    setIsSpeaking(true)
    speak(turn.jp, {
      rate: rateRef.current,
      voice: voiceRef.current,
      onEnd: () => setIsSpeaking(false),
    })
  }

  const handleToggleRecording = async () => {
    if (isRecording) {
      if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null }
      if (sessionRef.current) {
        const url = await sessionRef.current.stop()
        sessionRef.current = null
        setRecordingUrl(url)
      }
      setIsRecording(false)
    } else {
      setMicError(null)
      setHeardText(null)

      const SRClass = typeof window !== 'undefined'
        ? (window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null)
        : null

      if (SRClass) {
        const rec = new SRClass()
        rec.lang = 'ja-JP'
        rec.interimResults = false
        rec.maxAlternatives = 1
        rec.onresult = (e) => setHeardText(e.results[0][0].transcript)
        recognitionRef.current = rec
        try { rec.start() } catch { /* silent */ }
      }

      try {
        sessionRef.current = await startRecording()
        setIsRecording(true)
      } catch (err) {
        if (recognitionRef.current) { recognitionRef.current.abort(); recognitionRef.current = null }
        const name = err instanceof DOMException ? err.name : ''
        setMicError(
          name === 'NotAllowedError' || name === 'PermissionDeniedError'
            ? 'Bạn đã từ chối quyền microphone. Hãy cấp quyền trong cài đặt trình duyệt.'
            : 'Không thể khởi động microphone. Hãy thử lại.'
        )
      }
    }
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

  // --- Scenario picker ---
  if (!scenario) {
    return (
      <div>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 16 }}>
          Chọn tình huống để luyện hội thoại theo kịch bản thực tế. Bạn sẽ đóng vai và nói câu của mình.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {SCENARIOS.map((s) => (
            <div
              key={s.id}
              className="card"
              onClick={() => handleSelectScenario(s)}
              style={{ cursor: 'pointer', padding: 16 }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSelectScenario(s)}
            >
              <div style={{ fontFamily: 'var(--jp-serif)', fontSize: 17, fontWeight: 600, marginBottom: 4 }}>
                {s.title_jp}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink)', marginBottom: 6 }}>{s.title_vi}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 10 }}>{s.setting_vi}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                {s.npc_label} × {s.user_label} · {s.turns.length} lượt
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- Completed ---
  if (completed) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontFamily: 'var(--jp-serif)', fontSize: 24, marginBottom: 8 }}>会話完了</div>
        <div style={{ color: 'var(--good)', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Hoàn thành!</div>
        <div style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 24 }}>
          Bạn đã luyện xong tình huống <strong>{scenario.title_vi}</strong>.
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => { setTurnIdx(0); setCompleted(false); setHeardText(null); setShowExample(false); setRecordingUrl(null) }}
          >
            Luyện lại
          </button>
          <button className="btn" onClick={handleBack}>
            Chọn tình huống khác
          </button>
        </div>
      </div>
    )
  }

  // --- Conversation ---
  const turn = scenario.turns[turnIdx]
  const isNPC = turn.role === 'npc'
  const micOk = isRecordingSupported()
  const total = scenario.turns.length

  return (
    <div>
      {/* Conversation header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button className="btn" onClick={handleBack} style={{ fontSize: 12, padding: '4px 10px' }}>
          ← Tình huống khác
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--jp-serif)', fontSize: 15, fontWeight: 600 }}>
            {scenario.title_jp}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
            {scenario.title_vi} · Lượt {turnIdx + 1} / {total}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, marginBottom: 14 }}>
        <div style={{
          height: '100%',
          background: 'var(--good)',
          borderRadius: 2,
          width: `${(turnIdx / total) * 100}%`,
          transition: 'width 0.3s',
        }} />
      </div>

      <div className="card">
        {/* Role badge */}
        <div style={{ marginBottom: 12 }}>
          <span style={{
            display: 'inline-block',
            fontSize: 12, fontWeight: 700, padding: '2px 10px',
            borderRadius: 20,
            background: isNPC ? 'var(--ink)' : 'var(--accent)',
            color: '#fff',
          }}>
            {isNPC ? scenario.npc_label : 'あなた'}
          </span>
        </div>

        {/* NPC Japanese text */}
        {isNPC && (
          <div className="jp" style={{ marginBottom: 8 }}>{turn.jp}</div>
        )}

        {/* Hint / translation */}
        <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 16 }}>
          {turn.hint_vi}
        </div>

        {/* Example answer (user turns only) */}
        {!isNPC && turn.example && (
          <div style={{ marginBottom: 16 }}>
            {showExample ? (
              <div style={{
                background: 'var(--good-soft)',
                borderRadius: 8,
                padding: '10px 14px',
                fontFamily: 'var(--jp-serif)',
                fontSize: 22,
              }}>
                {turn.example}
              </div>
            ) : (
              <button className="btn" style={{ fontSize: 13 }} onClick={() => setShowExample(true)}>
                Xem câu mẫu
              </button>
            )}
          </div>
        )}

        {/* Speech recognition result */}
        {heardText && (
          <div className="heard" style={{ marginBottom: 12 }}>
            <div className="label">MÁY NGHE ĐƯỢC</div>
            <div className="txt">{heardText}</div>
          </div>
        )}

        {/* Mic error */}
        {micError && <div className="warn" style={{ marginBottom: 12 }}>{micError}</div>}
        {!micOk && !isNPC && (
          <div className="warn" style={{ marginBottom: 12 }}>
            Trình duyệt không hỗ trợ ghi âm. Hãy dùng Chrome/Edge để luyện nói.
          </div>
        )}

        {/* Controls */}
        <div className="controls">
          {isNPC ? (
            <>
              <button className="btn" onClick={handleReplayNPC} disabled={isSpeaking}>
                {isSpeaking ? '▶ Đang phát...' : '▶ Phát lại'}
              </button>
              <button className="btn btn-primary" onClick={handleNext}>
                Tiếp theo →
              </button>
            </>
          ) : (
            <>
              <button
                className={`btn btn-rec${isRecording ? ' recording' : ''}`}
                onClick={handleToggleRecording}
                disabled={!micOk}
              >
                {isRecording ? '■ Dừng' : '● Ghi âm'}
              </button>
              {recordingUrl && (
                <button className="btn" onClick={handlePlayback} disabled={isPlayingBack}>
                  {isPlayingBack ? '▶ Đang phát...' : '▶ Nghe lại'}
                </button>
              )}
              <button className="btn btn-primary" onClick={handleNext} disabled={isRecording}>
                Tiếp theo →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
