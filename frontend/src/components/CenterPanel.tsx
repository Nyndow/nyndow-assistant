import './Panel.css'
import './CenterPanel.css'

type CenterPanelProps = {
  busy: boolean
  currentSpeech: string
  isSpeaking: boolean
}
const CenterPanel = ({ busy, currentSpeech, isSpeaking }: CenterPanelProps) => {
  const hasResponse = currentSpeech.trim().length > 0

  return (
    <main className="panel center">
      <div className={`mic ${isSpeaking ? 'speaking' : ''}`} aria-hidden="true">
        <div className="mic-core">
          <div className="mic-icon" />
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
