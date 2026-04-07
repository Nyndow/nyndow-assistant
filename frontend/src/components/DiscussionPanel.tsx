import type { FormEvent } from 'react'
import type { ChatMessage } from '../types'
import { MessageCircle, Send, Loader2 } from 'lucide-react'
import './Panel.css'
import './DiscussionPanel.css'


type DiscussionPanelProps = {
  messages: ChatMessage[]
  input: string
  busy: boolean
  latestTranscript: string | null
  onInputChange: (value: string) => void
  onSend: (event?: FormEvent) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const DiscussionPanel = ({
  messages,
  input,
  busy,
  latestTranscript,
  onInputChange,
  onSend,
  isCollapsed,
  onToggleCollapse,
}: DiscussionPanelProps) => {
  const userMessages = messages.filter((message) => message.role === 'user')
  const transcriptText = latestTranscript?.trim()

  return (
    <aside className={`panel left${isCollapsed ? ' is-collapsed' : ''}`}>
      <div className="panel-header">
        <button
          type="button"
          className="panel-toggle"
          onClick={onToggleCollapse}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand discussion panel' : 'Collapse discussion panel'}
        >
          <MessageCircle size={18} />
        </button>
      </div>

      <div className="panel-body" aria-hidden={isCollapsed}>
        <div className="discussion-log">
          {transcriptText ? (
            <div className="message-block">
              <div className="message stt">
                <div className="bubble">
                  <span className="stt-label">STT</span>
                  <p>{transcriptText}</p>
                </div>
              </div>
            </div>
          ) : null}

          {userMessages.length === 0 ? (
            <div className="empty-state">
              <MessageCircle size={28} strokeWidth={1.5} />
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
            {busy
              ? <Loader2 size={18} className="thinking-dots" />
              : <Send size={18} strokeWidth={2} />
            }
          </button>
        </form>
      </div>
    </aside>
  )
}

export default DiscussionPanel
