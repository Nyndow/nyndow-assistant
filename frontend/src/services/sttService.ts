import { API_BASE } from './apiClient'

type SttResponse = {
  text?: string
}

export const transcribeAudio = async (audio: Blob): Promise<string> => {
  const formData = new FormData()
  formData.append('audio', audio, 'speech.webm')

  const response = await fetch(`${API_BASE}/api/stt`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`STT request failed: ${response.status}`)
  }

  const data = (await response.json()) as SttResponse
  return data.text?.trim() ?? ''
}
