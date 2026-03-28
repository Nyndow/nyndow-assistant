import type { FC } from 'react'
import { Mic } from 'lucide-react'
import './Panel.css'
import './CenterPanel.css'

type CenterPanelProps = {
  busy: boolean
  currentSpeech: string
  isSpeaking: boolean
}

const CenterPanel: FC<CenterPanelProps> = ({ currentSpeech, isSpeaking }) => {
  const hasResponse = currentSpeech.trim().length > 0

  return (
    <main className="panel center">
      <div className={`mic ${isSpeaking ? 'speaking' : ''}`} aria-hidden="true">
        <div className="mic-core">
          <Mic size={28} strokeWidth={2} />
        </div>
        <div className="mic-ring" />
        <div className="mic-ring delay" />
      </div>

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