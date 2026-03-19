import { postJson } from './apiClient'

export type ChatResponse = {
  reply: string
  session_id: string
}

export const sendChatMessage = (message: string, sessionId: string | null) => {
  return postJson<ChatResponse>('/api/chat', {
    message,
    session_id: sessionId,
  })
}
