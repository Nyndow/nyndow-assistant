import type { FC } from 'react'
import { Mic } from 'lucide-react'
import './Panel.css'
import './CenterPanel.css'

type CenterPanelProps = {
  currentSpeech: string
  isSpeaking: boolean
  isListening: boolean
  isRecording: boolean
  isTranscribing: boolean
  sttError: string | null
  onMicToggle: () => void
}

const CenterPanel: FC<CenterPanelProps> = ({
  currentSpeech,
  isSpeaking,
  isListening,
  isRecording,
  isTranscribing,
  sttError,
  onMicToggle,
}) => {
  const hasResponse = currentSpeech.trim().length > 0
  const status = sttError
    ? sttError
    : isTranscribing
      ? 'Transcribing...'
      : isListening
        ? isRecording
          ? 'Listening...'
          : 'Mic ready'
        : 'Mic off'

  return (
    <main className="panel center">
      <button
        type="button"
        className="mic-button"
        onClick={onMicToggle}
        aria-pressed={isListening}
        aria-label={isListening ? 'Stop microphone' : 'Start microphone'}
      >
        <div
          className={`mic ${isSpeaking ? 'speaking' : ''}${isListening ? ' listening' : ''}${
            isRecording ? ' recording' : ''
          }`}
          aria-hidden="true"
        >
          <div className="mic-core">
            <Mic size={28} strokeWidth={2} />
          </div>
          <div className="mic-ring" />
          <div className="mic-ring delay" />
        </div>
      </button>

      <p className={`center-status${sttError ? ' error' : ''}`}>{status}</p>

      <div className="center-response">
        {hasResponse ? (
          <p className="center-sentence">{currentSpeech}</p>
        ) : (
          <>
            <h1>How can I assist you today?</h1>
            <p className="subtitle">Ask a question to see the assistant response here.</p>
          </>
        )}
      </div>
    </main>
  )
}

export default CenterPanel
