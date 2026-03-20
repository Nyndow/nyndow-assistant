import type { FormEvent } from 'react'
import type { ChatMessage } from '../types'
import './Panel.css'
import './DiscussionPanel.css'


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
  const userMessages = messages.filter((message) => message.role === 'user')

  return (
    <aside className="panel left">
      <div className="panel-header">DISCUSSION</div>
      <div className="discussion-log">
        {userMessages.length === 0 ? (
          <div className="empty-state">
            <span>💬</span>
            <p>Start a discussion to see your messages here.</p>
          </div>
        ) : (
          userMessages.map((message, index) => (
            <div key={`user-${index}`} className="message-block">
              {index === 0 && <hr className="discussion-divider" />}
              <div className="message user">
                <div className="bubble">
                  <p>{message.content}</p>
                </div>
              </div>
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
          <span>{busy ? '...' : '➤'}</span>
        </button>
      </form>
    </aside>
  )
}

export default DiscussionPanel
