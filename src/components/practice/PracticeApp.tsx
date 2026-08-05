'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { sentences } from '@/data/sentences'
import { speak, stopSpeech, isSpeechAvailable } from '@/lib/speech/tts'
import { startRecording, isRecordingSupported, type RecordingSession } from '@/lib/speech/recorder'

// --- Mora splitting (gộp âm nhỏ ゃゅょ, tách っ ん ー) ---
const SMALL = 'ゃゅょぁぃぅぇぉャュョァィゥェォゎヮ'
function toMoras(kana: string): string[] {
  const clean = kana.replace(/[、。！？\s]/g, '')
  const out: string[] = []
  for (const ch of clean) {
    if (SMALL.includes(ch) && out.length > 0) out[out.length - 1] += ch
    else out.push(ch)
  }
  return out
}

// Levenshtein similarity — đây là khớp VĂN BẢN, không phải chấm phát âm
function similarity(a: string, b: string): number {
  const m = a.length, n = b.length
  if (!m || !n) return 0
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) => {
    const row = new Array(n + 1).fill(0) as number[]
    row[0] = i
    return row
  })
  for (let j = 0; j <= n; j++) d[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1]+(a[i-1]===b[j-1]?0:1))
  return Math.round((1 - d[m][n] / Math.max(m, n)) * 100)
}

// --- Pitch SVG (demo heiban — chưa có dữ liệu thật) ---
function PitchSVG({ kana }: { kana: string }) {
  const moras = toMoras(kana)
  if (moras.length === 0) return null

  const stepX = 30, padX = 14, hiY = 20, loY = 48, r = 4
  const width = padX * 2 + stepX * (moras.length - 1)
  const pts = moras.map((m, i) => ({
    x: padX + i * stepX,
    y: i === 0 ? loY : hiY, // heiban: mora đầu thấp, còn lại cao
    m,
  }))
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')

  return (
    <div className="pitch-wrap">
      <svg width={width} height={70} viewBox={`0 0 ${width} 70`} display="block">
        <path d={pathD} stroke="var(--accent)" strokeWidth={2} fill="none" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={r} fill="var(--accent)" />
            <text
              x={p.x} y={66}
              textAnchor="middle"
              fontFamily="var(--jp-serif)"
              fontSize={19}
              fill="var(--ink)"
            >
              {p.m}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// --- Main component ---
type Mode = 'shadow' | 'repeat'

export default function PracticeApp() {
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<Mode>('shadow')
  const [idx, setIdx] = useState(0)

  // Settings
  const [rate, setRate] = useState(0.9)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceIdx, setVoiceIdx] = useState(0)
  const [hideVi, setHideVi] = useState(false)

  // Shadowing state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(false)

  // Repeat state
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const [isPlayingBack, setIsPlayingBack] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const [heard, setHeard] = useState<{ text: string; score: number } | null>(null)

  // Refs — truy cập state mới nhất trong closures mà không cần deps
  const isLoopingRef = useRef(false)
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idxRef = useRef(0)
  const rateRef = useRef(0.9)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const sessionRef = useRef<RecordingSession | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevUrlRef = useRef<string | null>(null)

  isLoopingRef.current = isLooping
  idxRef.current = idx
  rateRef.current = rate
  voiceRef.current = voices[voiceIdx] ?? null

  useEffect(() => {
    setMounted(true)

    if (!isSpeechAvailable()) return

    function loadVoices() {
      const jaVoices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('ja'))
      setVoices(jaVoices)
    }
    loadVoices()
    speechSynthesis.addEventListener('voiceschanged', loadVoices)

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      stopSpeech()
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current)
      if (sessionRef.current) sessionRef.current.stop().then((url) => URL.revokeObjectURL(url))
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

  // Giải phóng blob URL cũ khi recordingUrl thay đổi
  useEffect(() => {
    const prev = prevUrlRef.current
    prevUrlRef.current = recordingUrl
    if (prev) URL.revokeObjectURL(prev)
  }, [recordingUrl])

  const resetSentenceState = useCallback(() => {
    stopSpeech()
    if (loopTimerRef.current) { clearTimeout(loopTimerRef.current); loopTimerRef.current = null }
    if (sessionRef.current) { sessionRef.current.stop().then((url) => URL.revokeObjectURL(url)); sessionRef.current = null }
    if (recognitionRef.current) { recognitionRef.current.abort(); recognitionRef.current = null }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setIsPlaying(false)
    setIsSpeaking(false)
    setIsRecording(false)
    setRecordingUrl(null)
    setIsPlayingBack(false)
    setMicError(null)
    setHeard(null)
  }, [])

  // --- Shadowing ---
  const shadowPlay = useCallback((i: number) => {
    setIsPlaying(true)
    speak(sentences[i].jp, {
      rate: rateRef.current,
      voice: voiceRef.current,
      onEnd: () => {
        setIsPlaying(false)
        if (isLoopingRef.current) {
          loopTimerRef.current = setTimeout(() => shadowPlay(idxRef.current), 2000)
        }
      },
    })
  }, [])

  const handleShadowPlay = () => {
    if (isPlaying) {
      stopSpeech()
      if (loopTimerRef.current) { clearTimeout(loopTimerRef.current); loopTimerRef.current = null }
      setIsPlaying(false)
    } else {
      shadowPlay(idx)
    }
  }

  const toggleLoop = () => {
    setIsLooping((prev) => {
      const next = !prev
      isLoopingRef.current = next
      if (!next && loopTimerRef.current) { clearTimeout(loopTimerRef.current); loopTimerRef.current = null }
      return next
    })
  }

  // --- Repeat ---
  const handleRepeatListen = () => {
    setIsSpeaking(true)
    setHeard(null)
    speak(sentences[idx].jp, {
      rate: rateRef.current,
      voice: voiceRef.current,
      onEnd: () => setIsSpeaking(false),
    })
  }

  const handleToggleRecording = async () => {
    if (isRecording) {
      // Dừng ghi âm
      if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null }
      if (sessionRef.current) {
        const url = await sessionRef.current.stop()
        sessionRef.current = null
        setRecordingUrl(url)
      }
      setIsRecording(false)
    } else {
      // Bắt đầu ghi âm
      setMicError(null)

      // Chạy song song SpeechRecognition nếu trình duyệt hỗ trợ (Chrome/Edge)
      const SRClass = typeof window !== 'undefined'
        ? (window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null)
        : null

      if (SRClass) {
        const rec = new SRClass()
        rec.lang = 'ja-JP'
        rec.interimResults = false
        rec.maxAlternatives = 1
        rec.onresult = (e) => {
          const text = e.results[0][0].transcript
          const target = sentences[idxRef.current].jp.replace(/[、。？！\s]/g, '')
          const said = text.replace(/[、。？！\s]/g, '')
          setHeard({ text, score: similarity(said, target) })
        }
        recognitionRef.current = rec
        try { rec.start() } catch { /* silent fail — bản ghi âm vẫn hoạt động */ }
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

  // --- Nav ---
  const handlePrev = () => { resetSentenceState(); setIdx((i) => (i - 1 + sentences.length) % sentences.length) }
  const handleNext = () => { resetSentenceState(); setIdx((i) => (i + 1) % sentences.length) }
  const handleMode = (m: Mode) => { resetSentenceState(); setMode(m) }

  // Loading skeleton
  if (!mounted) {
    return (
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ height: 40, marginBottom: 16, background: 'var(--surface)', borderRadius: 'var(--radius)', opacity: 0.6 }} />
        <div style={{ height: 320, background: 'var(--surface)', borderRadius: 'var(--radius)', opacity: 0.6 }} />
      </div>
    )
  }

  if (!isSpeechAvailable()) {
    return (
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '24px 16px' }}>
        <div className="card warn">
          Trình duyệt của bạn không hỗ trợ Text-to-Speech. Vui lòng dùng Chrome hoặc Edge.
        </div>
      </div>
    )
  }

  const sentence = sentences[idx]
  const micOk = isRecordingSupported()

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '24px 16px 64px' }}>

      {/* Header */}
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1 style={{ fontFamily: 'var(--jp-serif)', fontSize: 30, letterSpacing: '.04em', fontWeight: 600 }}>
            発声練習
          </h1>
          <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>hassei renshū · luyện nói</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
          Nghe mẫu → nói theo → nghe lại giọng mình. Vòng lặp cốt lõi cho trình độ N3–N2.
        </p>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab${mode === 'shadow' ? ' active' : ''}`} onClick={() => handleMode('shadow')}>
          Shadowing<span className="badge">nói theo tức thì</span>
        </button>
        <button className={`tab${mode === 'repeat' ? ' active' : ''}`} onClick={() => handleMode('repeat')}>
          Nghe &amp; nói lại<span className="badge">có nhịp nghỉ</span>
        </button>
        <button className="tab" disabled>
          Roleplay<span className="badge">giai đoạn 2</span>
        </button>
      </div>

      {/* Card */}
      <div className="card">
        {/* Progress */}
        <div className="progress">
          <span>Câu {idx + 1} / {sentences.length}</span>
          <div className="dots">
            {sentences.map((_, i) => (
              <div key={i} className={`dot${i === idx ? ' on' : ''}`} />
            ))}
          </div>
        </div>

        {/* Pitch diagram (demo) */}
        <span className="pitch-demo-tag">Đường cao độ minh họa — thay bằng dữ liệu OJAD thật</span>
        <PitchSVG kana={sentence.kana} />

        {/* JP sentence */}
        <div className="jp">{sentence.jp}</div>

        {/* Vietnamese meaning */}
        <div className={`meaning${hideVi ? ' hidden' : ''}`}>{sentence.meaning_vi}</div>

        {/* Controls */}
        <div className="controls">
          {mode === 'shadow' && (
            <>
              <button
                className={`btn${isPlaying ? '' : ' btn-primary'}`}
                onClick={handleShadowPlay}
              >
                {isPlaying ? '■ Dừng' : '▶ Phát âm mẫu'}
              </button>
              <button
                className={`btn${isLooping ? ' btn-primary' : ''}`}
                onClick={toggleLoop}
              >
                ↺ {isLooping ? 'Đang lặp' : 'Lặp lại'}
              </button>
            </>
          )}

          {mode === 'repeat' && (
            <>
              <button
                className="btn btn-primary"
                onClick={handleRepeatListen}
                disabled={isSpeaking || isRecording}
              >
                {isSpeaking ? '▶ Đang phát...' : '▶ Nghe mẫu'}
              </button>
              <button
                className={`btn btn-rec${isRecording ? ' recording' : ''}`}
                onClick={handleToggleRecording}
                disabled={!micOk || isSpeaking}
              >
                {isRecording ? '■ Dừng' : '● Ghi âm'}
              </button>
              <button
                className="btn"
                onClick={handlePlayback}
                disabled={!recordingUrl || isPlayingBack}
              >
                {isPlayingBack ? '▶ Đang phát...' : '▶ Nghe lại giọng mình'}
              </button>
            </>
          )}
        </div>

        {/* Feedback area */}
        <div className="feedback">
          {micError && <div className="warn">{micError}</div>}
          {!micOk && mode === 'repeat' && (
            <div className="warn">Trình duyệt này không hỗ trợ ghi âm. Hãy dùng Chrome/Edge.</div>
          )}
          {heard && (() => {
            const color = heard.score >= 80 ? 'var(--good)' : heard.score >= 50 ? '#c98a1a' : 'var(--accent)'
            return (
              <div className="heard">
                <div className="label">MÁY NGHE ĐƯỢC</div>
                <div className="txt">{heard.text}</div>
                <div style={{ marginTop: 8, fontSize: 14 }}>
                  Độ khớp từ:{' '}
                  <span style={{ fontWeight: 600, color }}>{heard.score}%</span>
                  <span style={{ color: 'var(--ink-soft)', fontSize: 12, marginLeft: 8 }}>
                    (so khớp văn bản, không phải điểm phát âm)
                  </span>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Nav */}
        <div className="nav">
          <button className="btn" onClick={handlePrev}>← Câu trước</button>
          <button className="btn" onClick={handleNext}>Câu sau →</button>
        </div>
      </div>

      {/* Settings */}
      <div className="settings">
        <h3>Cài đặt</h3>
        <div className="row">
          <label>Tốc độ đọc mẫu ({rate.toFixed(1)}×)</label>
          <input
            type="range" min="0.5" max="1.2" step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
          />
        </div>
        <div className="row">
          <label>Giọng đọc</label>
          <select value={voiceIdx} onChange={(e) => setVoiceIdx(Number(e.target.value))}>
            {voices.length === 0
              ? <option value={0}>(máy chưa có giọng tiếng Nhật)</option>
              : voices.map((v, i) => (
                  <option key={i} value={i}>{v.name} ({v.lang})</option>
                ))}
          </select>
        </div>
        <div className="row">
          <label>Ẩn nghĩa tiếng Việt (tự thử thách)</label>
          <label className="switch">
            <input type="checkbox" checked={hideVi} onChange={(e) => setHideVi(e.target.checked)} />
            <span className="slider" />
          </label>
        </div>
      </div>
    </div>
  )
}
