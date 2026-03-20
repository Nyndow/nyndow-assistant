import { useState } from 'react'
import type { ChangeEvent, RefObject } from 'react'
import { FileUp, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import './Panel.css'
import './OptionsPanel.css'

type OptionsPanelProps = {
  status?: string
  isLoading?: boolean
  onImportClick: () => void
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  fileInputRef: RefObject<HTMLInputElement>
}

const OptionsPanel = ({
  status,
  isLoading = false,
  onImportClick,
  onFileChange,
  onClear,
  fileInputRef,
}: OptionsPanelProps) => {
  const [confirmClear, setConfirmClear] = useState(false)

  const handleClearClick = () => {
    if (confirmClear) {
      onClear()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
    }
  }

  return (
    <aside className="panel right">
      <div className="panel-header">OPTIONS</div>

      <div
        className={`option-card primary${isLoading ? ' loading' : ''}`}
        onClick={!isLoading ? onImportClick : undefined}
        role="button"
        aria-disabled={isLoading}
      >
        <div className="option-icon">
          {isLoading
            ? <Loader2 size={20} className="spin" />
            : <FileUp size={20} />
          }
        </div>
        <div>
          <h3>{isLoading ? 'Importing…' : 'Import PDF'}</h3>
          <p>{isLoading ? 'Processing your document' : 'Upload a document to enhance context'}</p>
        </div>
      </div>

      {status && <p className="option-status">{status}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={onFileChange}
        hidden
      />

      <div
        className={`option-card danger${confirmClear ? ' confirming' : ''}`}
        onClick={handleClearClick}
        onBlur={() => setConfirmClear(false)}
        role="button"
        tabIndex={0}
      >
        <div className="option-icon">
          {confirmClear
            ? <AlertTriangle size={20} />
            : <Trash2 size={20} />
          }
        </div>
        <div>
          <h3>{confirmClear ? 'Are you sure?' : 'Clear Discussion'}</h3>
          <p>{confirmClear ? 'Click again to confirm' : 'Remove all previous messages'}</p>
        </div>
      </div>
    </aside>
  )
}

export default OptionsPanel