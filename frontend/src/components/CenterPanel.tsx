type CenterPanelProps = {
  busy: boolean
  currentSpeech: string
}
const CenterPanel = ({ busy, currentSpeech }: CenterPanelProps) => {
  const hasResponse = currentSpeech.trim().length > 0

  return (
    <main className="panel center">
      <div className="status">● SYSTEM: {busy ? 'THINKING' : 'READY'}</div>
      <div className="mic" aria-hidden="true">
        🎤
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
