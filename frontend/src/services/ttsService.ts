import { API_BASE } from './apiClient'

export const fetchTtsAudio = async (text: string): Promise<Blob> => {
  const response = await fetch(`${API_BASE}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    throw new Error(`TTS request failed: ${response.status}`)
  }

  return response.blob()
}
