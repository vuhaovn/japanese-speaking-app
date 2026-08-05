// Only call these functions from browser context (event handlers, useEffect)

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis
  const existing = synth.getVoices()
  if (existing.length > 0) return Promise.resolve(existing)

  return new Promise((resolve) => {
    // Safari may never fire onvoiceschanged, so we fall back after 1s
    const timeout = setTimeout(() => resolve(synth.getVoices()), 1000)
    synth.onvoiceschanged = () => {
      clearTimeout(timeout)
      resolve(synth.getVoices())
    }
  })
}

export async function speak(
  text: string,
  options?: {
    rate?: number
    voice?: SpeechSynthesisVoice | null
    onStart?: () => void
    onEnd?: () => void
  }
): Promise<void> {
  const synth = window.speechSynthesis
  synth.cancel()

  const voices = await waitForVoices()
  const voice = options?.voice ?? voices.find((v) => v.lang.startsWith('ja')) ?? null

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ja-JP'
    utterance.rate = options?.rate ?? 0.85

    if (voice) utterance.voice = voice
    if (options?.onStart) utterance.onstart = () => options.onStart!()

    utterance.onend = () => {
      options?.onEnd?.()
      resolve()
    }
    utterance.onerror = () => resolve()

    synth.speak(utterance)
  })
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined') {
    window.speechSynthesis.cancel()
  }
}

export function isSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
