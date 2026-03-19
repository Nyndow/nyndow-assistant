import { useCallback, useRef, useState } from 'react'
import type { ChatMessage } from '../types'
import { sendChatMessage } from '../services/chatService'
import { fetchTtsAudio } from '../services/ttsService'

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [useDocs, setUseDocs] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speakText = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    try {
      const blob = await fetchTtsAudio(trimmed)
      const url = URL.createObjectURL(blob)

      if (audioRef.current) {
        audioRef.current.pause()
      }

      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => {
        URL.revokeObjectURL(url)
      }
      await audio.play()
    } catch {
      // TTS is optional; ignore failures so chat still works.
    }
  }, [])

  const sendMessage = useCallback(
    async (messageText?: string) => {
      const trimmed = (messageText ?? input).trim()
      if (!trimmed || busy) return

      setInput('')
      setBusy(true)
      setMessages((prev) => [...prev, { role: 'user', content: trimmed }])

      try {
        const data = await sendChatMessage(trimmed, sessionId, useDocs)
        setSessionId(data.session_id)
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
        void speakText(data.reply)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${message}` },
        ])
      } finally {
        setBusy(false)
      }
    },
    [busy, input, sessionId, useDocs]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setSessionId(null)
  }, [])

  return {
    messages,
    input,
    setInput,
    busy,
    sendMessage,
    clearMessages,
    useDocs,
    setUseDocs,
  }
}
