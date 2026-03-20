import { useRef, type FormEvent, type ChangeEvent } from 'react'
import CenterPanel from './components/CenterPanel'
import DiscussionPanel from './components/DiscussionPanel'
import OptionsPanel from './components/OptionsPanel'
import { useChat } from './hooks/useChat'
import { usePdfIngest } from './hooks/usePdfIngest'
import './App.css'

function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { messages, input, setInput, busy, currentSpeech, isSpeaking, sendMessage, clearMessages } =
    useChat()
  const { status, ingest } = usePdfIngest()

  const handleSend = async (event?: FormEvent) => {
    event?.preventDefault()
    await sendMessage()
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await ingest(file)
    event.target.value = ''
  }

  return (
    <div className="app">
      <DiscussionPanel
        messages={messages}
        input={input}
        busy={busy}
        onInputChange={setInput}
        onSend={handleSend}
      />

      <CenterPanel busy={busy} currentSpeech={currentSpeech} isSpeaking={isSpeaking} />

      <OptionsPanel
        status={status}
        onImportClick={handleImportClick}
        onFileChange={handleFileChange}
        onClear={clearMessages}
        fileInputRef={fileInputRef}
      />
    </div>
  )
}

export default App
