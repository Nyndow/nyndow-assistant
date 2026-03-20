import { useCallback, useRef, useState } from 'react'
import type { ChatMessage } from '../types'
import { streamChatMessage } from '../services/chatService'
import { fetchTtsAudio } from '../services/ttsService'

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [currentSpeech, setCurrentSpeech] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ttsQueueRef = useRef<string[]>([])
  const speakingRef = useRef(false)
  const spokenCountRef = useRef(0)

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

      await new Promise<void>((resolve) => {
        const cleanup = () => {
          URL.revokeObjectURL(url)
          audio.onended = null
          audio.onerror = null
          resolve()
        }

        audio.onended = cleanup
        audio.onerror = cleanup

        audio.play().catch(cleanup)
      })
    } catch {
      // TTS is optional; ignore failures so chat still works.
    }
  }, [])

  const splitSentences = useCallback((text: string) => {
    const sentenceRegex = /[^.!?]+[.!?]+(?:["')\]]+)?/g
    const matches = text.match(sentenceRegex) ?? []
    const consumed = matches.join('')
    const fragment = text.slice(consumed.length).trim()
    const sentences = matches.map((sentence) => sentence.trim()).filter(Boolean)

    return { sentences, fragment }
  }, [])

  const drainTtsQueue = useCallback(async () => {
    if (speakingRef.current) return
    speakingRef.current = true

    while (ttsQueueRef.current.length > 0) {
      const nextSentence = ttsQueueRef.current.shift()
      if (nextSentence) {
        setCurrentSpeech(nextSentence)
        await speakText(nextSentence)
      }
    }

    speakingRef.current = false
  }, [speakText])

  const enqueueSentences = useCallback(
    (text: string, flushFragment: boolean) => {
      const { sentences, fragment } = splitSentences(text)
      if (sentences.length > spokenCountRef.current) {
        const newSentences = sentences.slice(spokenCountRef.current)
        ttsQueueRef.current.push(...newSentences)
        spokenCountRef.current = sentences.length
      }

      if (flushFragment && fragment) {
        ttsQueueRef.current.push(fragment)
      }

      void drainTtsQueue()
    },
    [drainTtsQueue, splitSentences]
  )

  const sendMessage = useCallback(
    async (messageText?: string) => {
      const trimmed = (messageText ?? input).trim()
      if (!trimmed || busy) return

      setInput('')
      setBusy(true)
      setCurrentSpeech('')
      spokenCountRef.current = 0
      ttsQueueRef.current = []
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: trimmed },
        { role: 'assistant', content: '' },
      ])

      try {
        let accumulated = ''
        let updatedSessionId = sessionId

        for await (const chunk of streamChatMessage(trimmed, sessionId)) {
          if (chunk.type === 'error' && chunk.message) {
            throw new Error(chunk.message)
          }

          if (chunk.type === 'content' && chunk.delta) {
            accumulated += chunk.delta
            setMessages((prev) => {
              if (prev.length === 0) {
                return [{ role: 'assistant', content: accumulated }]
              }

              const next = [...prev]
              const lastIndex = next.length - 1
              if (next[lastIndex]?.role === 'assistant') {
                next[lastIndex] = { role: 'assistant', content: accumulated }
              } else {
                next.push({ role: 'assistant', content: accumulated })
              }
              return next
            })
            enqueueSentences(accumulated, false)
          }

          if (chunk.type === 'done' && chunk.session_id) {
            updatedSessionId = chunk.session_id
          }
        }

        if (updatedSessionId !== sessionId) {
          setSessionId(updatedSessionId)
        }

        if (accumulated.trim()) {
          enqueueSentences(accumulated, true)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setMessages((prev) => {
          if (prev.length === 0) {
            return [{ role: 'assistant', content: `Error: ${message}` }]
          }
          const next = [...prev]
          const lastIndex = next.length - 1
          if (next[lastIndex]?.role === 'assistant') {
            next[lastIndex] = { role: 'assistant', content: `Error: ${message}` }
          } else {
            next.push({ role: 'assistant', content: `Error: ${message}` })
          }
          return next
        })
      } finally {
        setBusy(false)
      }
    },
    [busy, input, sessionId, speakText]
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
    currentSpeech,
    sendMessage,
    clearMessages,
  }
}
