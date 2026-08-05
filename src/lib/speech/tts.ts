let currentAudio: HTMLAudioElement | null = null

export function speak(
  text: string,
  options: { rate?: number; voice?: string; onEnd?: () => void } = {}
): void {
  stopSpeech()

  void (async () => {
    try {
      const params = new URLSearchParams({ text, rate: String(options.rate ?? 1) })
      if (options.voice) params.set('voice', options.voice)

      const res = await fetch(`/api/tts?${params}`)
      if (!res.ok) throw new Error(`TTS ${res.status}`)

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      currentAudio = audio

      audio.onended = () => {
        URL.revokeObjectURL(url)
        currentAudio = null
        options.onEnd?.()
      }
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        currentAudio = null
        options.onEnd?.()
      }

      await audio.play()
    } catch {
      // Fallback to Web Speech API nếu cloud TTS không khả dụng
      if (typeof speechSynthesis !== 'undefined') {
        const utt = new SpeechSynthesisUtterance(text)
        utt.lang = 'ja-JP'
        utt.rate = options.rate ?? 1
        utt.onend = () => options.onEnd?.()
        utt.onerror = () => options.onEnd?.()
        speechSynthesis.speak(utt)
      } else {
        options.onEnd?.()
      }
    }
  })()
}

export function stopSpeech(): void {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.onended = null
    currentAudio.onerror = null
    currentAudio = null
  }
  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.cancel()
  }
}

export function isSpeechAvailable(): boolean {
  return true
}
