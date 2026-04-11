import { useCallback, useEffect, useRef, useState } from 'react'
import { MicVAD } from '@ricky0123/vad-web'
import { transcribeAudio } from '../services/sttService'

type VoiceInputOptions = {
  onTranscript?: (text: string) => void | Promise<void>
  disabled?: boolean
}

const pickMimeType = () => {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
  ]
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

const VAD_ASSET_BASE =
  'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.30/dist/'
const ORT_WASM_BASE = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/'

export const useVoiceInput = ({ onTranscript, disabled }: VoiceInputOptions = {}) => {
  const [listening, setListening] = useState(false)
  const [userSpeaking, setUserSpeaking] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const vadRef = useRef<MicVAD | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const stopResolverRef = useRef<((blob: Blob | null) => void) | null>(null)
  const destroyedRef = useRef(false)

  // Always-current ref so handleTranscript never captures a stale onTranscript
  const onTranscriptRef = useRef(onTranscript)
  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  const stopMediaTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const teardownRecorder = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder) return
    recorder.ondataavailable = null
    recorder.onstop = null
    recorderRef.current = null
  }, [])

  const stopRecording = useCallback(async () => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') {
      return null
    }

    return new Promise<Blob | null>((resolve) => {
      stopResolverRef.current = resolve
      try {
        recorder.stop()
      } catch {
        stopResolverRef.current = null
        resolve(null)
      }
    })
  }, [])

  const startRecording = useCallback((stream: MediaStream) => {
    let recorder = recorderRef.current
    if (!recorder) {
      const mimeType = pickMimeType()
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      recorder.onstop = () => {
        const blob =
          chunksRef.current.length > 0
            ? new Blob(chunksRef.current, { type: recorder?.mimeType || 'audio/webm' })
            : null
        chunksRef.current = []
        if (stopResolverRef.current) {
          stopResolverRef.current(blob)
          stopResolverRef.current = null
        }
      }
      recorderRef.current = recorder
    }

    if (recorder.state !== 'recording') {
      chunksRef.current = []
      recorder.start()
    }
  }, [])

  // Uses ref so it's never stale, and has no deps that cause re-creation
  const handleTranscript = useCallback(async (blob: Blob) => {
    setTranscribing(true)
    try {
      const text = await transcribeAudio(blob)
      if (!destroyedRef.current && onTranscriptRef.current) {
        await onTranscriptRef.current(text)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'STT failed'
      if (!destroyedRef.current) {
        setError(message)
      }
    } finally {
      if (!destroyedRef.current) {
        setTranscribing(false)
      }
    }
  }, []) // no deps needed — onTranscript accessed via ref

  const stopListening = useCallback(async () => {
    vadRef.current?.pause()
    vadRef.current = null

    setListening(false)
    setUserSpeaking(false)

    await stopRecording()
    teardownRecorder()
    stopMediaTracks()
  }, [stopMediaTracks, stopRecording, teardownRecorder])

  const startListening = useCallback(async () => {
    if (disabled || listening) return
    setError(null)

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser.')
      }
      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder is not supported in this browser.')
      }

      const stream =
        streamRef.current ??
        (await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        }))

      streamRef.current = stream

      const vad = await MicVAD.new({
        getStream: async () => stream,
        pauseStream: async () => {},
        resumeStream: async () => stream,
        model: 'v5',
        baseAssetPath: VAD_ASSET_BASE,
        onnxWASMBasePath: ORT_WASM_BASE,
        onSpeechStart: () => {
          setUserSpeaking(true)
          startRecording(stream)
        },
        onSpeechEnd: async () => {
          setUserSpeaking(false)
          const blob = await stopRecording()
          if (blob && blob.size > 0) {
            await handleTranscript(blob)
          }
        },
        onVADMisfire: async () => {
          setUserSpeaking(false)
          await stopRecording()
        },
      })

      vadRef.current = vad
      vad.start()
      setListening(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to start microphone'
      setError(message)
      await stopListening()
    }
  }, [disabled, handleTranscript, listening, startRecording, stopListening, stopRecording])

  const toggleListening = useCallback(async () => {
    if (listening) {
      await stopListening()
    } else {
      await startListening()
    }
  }, [listening, startListening, stopListening])

  useEffect(() => {
    if (disabled && listening) {
      void stopListening()
    }
  }, [disabled, listening, stopListening])

  useEffect(() => {
    return () => {
      destroyedRef.current = true
      void stopListening()
    }
  }, [stopListening])

  return {
    listening,
    userSpeaking,
    transcribing,
    error,
    startListening,
    stopListening,
    toggleListening,
  }
}