import { useEffect, useRef, useState, type FormEvent, type ChangeEvent } from 'react'
import CenterPanel from './components/CenterPanel'
import DiscussionPanel from './components/DiscussionPanel'
import OptionsPanel from './components/OptionsPanel'
import CalendarModal from './components/CalendarModal'
import { useChat } from './hooks/useChat'
import { usePdfIngest } from './hooks/usePdfIngest'
import { useVoiceInput } from './hooks/useVoiceInput'
import './App.css'

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [discussionCollapsed, setDiscussionCollapsed] = useState(false)
  const [optionsCollapsed, setOptionsCollapsed] = useState(false)
  const pendingVoiceRef = useRef<string | null>(null)
  const { messages, input, setInput, busy, currentSpeech, isSpeaking, sendMessage, clearMessages } =
    useChat()
  const { status, ingest } = usePdfIngest()
  const {
    listening,
    userSpeaking,
    transcribing,
    error: sttError,
    toggleListening,
  } = useVoiceInput({
    disabled: busy,
    onTranscript: async (text) => {
      if (!text.trim()) {
        return
      }
      if (busy) {
        pendingVoiceRef.current = text
        return
      }
      await sendMessage(text)
    },
  })

  useEffect(() => {
    if (!busy && pendingVoiceRef.current) {
      const queued = pendingVoiceRef.current
      pendingVoiceRef.current = null
      void sendMessage(queued)
    }
  }, [busy, sendMessage])

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
    <div
      className={`app${optionsCollapsed ? ' is-left-collapsed' : ''}${
        discussionCollapsed ? ' is-right-collapsed' : ''
      }`}
    >
      <OptionsPanel
        status={status}
        onImportClick={handleImportClick}
        onOpenCalendar={() => setCalendarOpen(true)}
        onFileChange={handleFileChange}
        onClear={clearMessages}
        fileInputRef={fileInputRef}
        isCollapsed={optionsCollapsed}
        onToggleCollapse={() => setOptionsCollapsed((prev) => !prev)}
      />

      <CenterPanel
        currentSpeech={currentSpeech}
        isSpeaking={isSpeaking}
        isListening={listening}
        isRecording={userSpeaking}
        isTranscribing={transcribing}
        sttError={sttError}
        onMicToggle={toggleListening}
      />

      <DiscussionPanel
        messages={messages}
        input={input}
        busy={busy}
        onInputChange={setInput}
        onSend={handleSend}
        isCollapsed={discussionCollapsed}
        onToggleCollapse={() => setDiscussionCollapsed((prev) => !prev)}
      />

      <CalendarModal
        isOpen={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelect={(date) => {
          setSelectedDate(date)
          setCalendarOpen(false)
        }}
      />
    </div>
  )
}

export default App
