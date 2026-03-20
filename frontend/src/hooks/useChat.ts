import { useCallback, useRef, useState } from 'react'
import type { ChatMessage } from '../types'
import { streamChatMessage } from '../services/chatService'
import { fetchTtsAudio } from '../services/ttsService'

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [currentSpeech, setCurrentSpeech] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ttsQueueRef = useRef<
    {
      text: string
      url?: string
      prepare?: () => Promise<string | null>
    }[]
  >([])
  const speakingRef = useRef(false)
  const spokenCountRef = useRef(0)

  const playAudio = useCallback(async (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(url)
    audioRef.current = audio

    await new Promise<void>((resolve) => {
      const cleanup = () => {
        audio.onended = null
        audio.onerror = null
        setIsSpeaking(false)
        resolve()
      }

      setIsSpeaking(true)
      audio.onended = cleanup
      audio.onerror = cleanup

      audio.play().catch(cleanup)
    })
  }, [])

  const buildTtsItem = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return null

    const item = {
      text: trimmed,
      prepare: async () => {
        try {
          const blob = await fetchTtsAudio(trimmed)
          const url = URL.createObjectURL(blob)
          item.url = url
          return url
        } catch {
          return null
        }
      },
    }

    return item
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
      const nextItem = ttsQueueRef.current.shift()
      if (!nextItem) continue

      setCurrentSpeech(nextItem.text)

      try {
        const url = nextItem.url ?? (nextItem.prepare ? await nextItem.prepare() : null)
        if (url) {
          await playAudio(url)
          URL.revokeObjectURL(url)
        }
      } catch {
        // TTS is optional; ignore failures so chat still works.
      }
    }

    speakingRef.current = false
  }, [playAudio])

  const enqueueSentences = useCallback(
    (text: string, flushFragment: boolean) => {
      const { sentences, fragment } = splitSentences(text)
      if (sentences.length > spokenCountRef.current) {
        const newSentences = sentences.slice(spokenCountRef.current)
        const items = newSentences
          .map((sentence) => buildTtsItem(sentence))
          .filter((item): item is NonNullable<typeof item> => item !== null)
        ttsQueueRef.current.push(...items)
        items.forEach((item) => {
          void item.prepare?.()
        })
        spokenCountRef.current = sentences.length
      }

      if (flushFragment && fragment) {
        const item = buildTtsItem(fragment)
        if (item) {
          ttsQueueRef.current.push(item)
          void item.prepare?.()
        }
      }

      void drainTtsQueue()
    },
    [buildTtsItem, drainTtsQueue, splitSentences]
  )

  const sendMessage = useCallback(
    async (messageText?: string) => {
      const trimmed = (messageText ?? input).trim()
      if (!trimmed || busy) return

      setInput('')
      setBusy(true)
      setCurrentSpeech('')
      setIsSpeaking(false)
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
    [busy, enqueueSentences, input, sessionId]
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
    isSpeaking,
    sendMessage,
    clearMessages,
  }
}
