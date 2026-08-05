import { NextRequest } from 'next/server'

const VALID_VOICES = new Set([
  'ja-JP-Neural2-A',
  'ja-JP-Neural2-B',
  'ja-JP-Neural2-C',
  'ja-JP-Neural2-D',
])

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text')
  const rate = Math.max(0.25, Math.min(4.0, parseFloat(searchParams.get('rate') ?? '1')))
  const voice = VALID_VOICES.has(searchParams.get('voice') ?? '')
    ? (searchParams.get('voice') as string)
    : 'ja-JP-Neural2-B'

  if (!text) return new Response('Missing text', { status: 400 })

  const apiKey = process.env.GOOGLE_TTS_API_KEY
  if (!apiKey) return new Response('GOOGLE_TTS_API_KEY not configured', { status: 503 })

  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'ja-JP', name: voice },
        audioConfig: { audioEncoding: 'MP3', speakingRate: rate },
      }),
    }
  )

  if (!res.ok) {
    console.error('Google TTS error:', await res.text())
    return new Response('TTS API error', { status: 502 })
  }

  const { audioContent } = await res.json() as { audioContent: string }
  const audio = Buffer.from(audioContent, 'base64')

  return new Response(audio, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
