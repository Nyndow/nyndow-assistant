import { API_BASE, postJson } from './apiClient'

export type ChatResponse = {
  reply: string
  session_id: string
}

export type ChatStreamChunk = {
  type: 'thinking' | 'content' | 'done' | 'error'
  delta?: string
  session_id?: string
  content?: string
  thinking?: string
  message?: string
}

export const sendChatMessage = (message: string, sessionId: string | null) => {
  return postJson<ChatResponse>('/api/chat', {
    message,
    session_id: sessionId,
  })
}

export async function* streamChatMessage(
  message: string,
  sessionId: string | null
): AsyncGenerator<ChatStreamChunk> {
  const response = await fetch(`${API_BASE}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      session_id: sessionId,
    }),
  })

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`)
  }

  if (!response.body) {
    throw new Error('Streaming response body is missing')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    let newlineIndex = buffer.indexOf('\n')
    while (newlineIndex !== -1) {
      const line = buffer.slice(0, newlineIndex).trim()
      buffer = buffer.slice(newlineIndex + 1)

      if (line) {
        try {
          yield JSON.parse(line) as ChatStreamChunk
        } catch {
          // Ignore malformed chunks.
        }
      }

      newlineIndex = buffer.indexOf('\n')
    }
  }

  const remaining = buffer.trim()
  if (remaining) {
    try {
      yield JSON.parse(remaining) as ChatStreamChunk
    } catch {
      // Ignore malformed chunks.
    }
  }
}
