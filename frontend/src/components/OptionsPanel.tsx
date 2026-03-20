import type { ChangeEvent, RefObject } from 'react'
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
  return (
    <aside className="panel right">
      <div className="panel-header">OPTIONS</div>

      <div className="option-card primary" onClick={onImportClick}>
        <div className="option-icon">📄</div>
        <div>
          <h3>Import PDF</h3>
          <p>Upload a document to enhance context</p>
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

      <div className="option-card danger" onClick={onClear}>
        <div className="option-icon">🗑️</div>
        <div>
          <h3>Clear Discussion</h3>
          <p>Remove all previous messages</p>
        </div>
      </div>
    </aside>
  )
}

export default OptionsPanel