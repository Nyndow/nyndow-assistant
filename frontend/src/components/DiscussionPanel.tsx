import type { FormEvent } from 'react'
import type { ChatMessage } from '../types'


type DiscussionPanelProps = {
  messages: ChatMessage[]
  input: string
  busy: boolean
  onInputChange: (value: string) => void
  onSend: (event?: FormEvent) => void
}

const DiscussionPanel = ({
  messages,
  input,
  busy,
  onInputChange,
  onSend,
}: DiscussionPanelProps) => {
  return (
    <aside className="panel left">
      <div className="panel-header">DISCUSSION</div>
      <div className="discussion-log">
        {messages.length === 0 ? (
          <div className="empty-state">Start a discussion to see responses here.</div>
        ) : (
          messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`message ${message.role}`}>
              <span className="message-role">{message.role === 'user' ? 'You' : 'Assistant'}</span>
              <p>{message.content}</p>
            </div>
          ))
        )}
      </div>
      <form className="discussion-input" onSubmit={onSend}>
        <input
          type="text"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Ask Nyndow anything..."
          disabled={busy}
        />
        <button className="btn send" type="submit" disabled={busy}>
          {busy ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </aside>
  )
}

export default DiscussionPanel
