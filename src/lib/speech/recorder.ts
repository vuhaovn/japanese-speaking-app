// Only call from browser context (event handlers, useEffect)

export interface RecordingSession {
  stop: () => Promise<string>
}

export async function startRecording(): Promise<RecordingSession> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const chunks: Blob[] = []
  const recorder = new MediaRecorder(stream)

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }
  recorder.start()

  return {
    stop(): Promise<string> {
      return new Promise((resolve) => {
        recorder.onstop = () => {
          // Stop all tracks to turn off the mic indicator
          stream.getTracks().forEach((t) => t.stop())
          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
          resolve(URL.createObjectURL(blob))
        }
        recorder.stop()
      })
    },
  }
}

export function isRecordingSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    typeof MediaRecorder !== 'undefined'
  )
}
