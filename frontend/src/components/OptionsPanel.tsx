import type { ChangeEvent, RefObject } from 'react'
import './Panel.css'
import './OptionsPanel.css'


type OptionsPanelProps = {
  status: string
  onImportClick: () => void
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  fileInputRef: RefObject<HTMLInputElement>
}

const OptionsPanel = ({
  status,
  onImportClick,
  onFileChange,
  onClear,
  fileInputRef,
}: OptionsPanelProps) => {
  return (
    <aside className="panel right">
      <div className="panel-header">OPTIONS</div>
      <button className="btn option" onClick={onImportClick}>
        Import PDF
      </button>
      <p className="option-status">{status}</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={onFileChange}
        hidden
      />
      <button className="btn option secondary" onClick={onClear}>
        Clear Discussion
      </button>
    </aside>
  )
}

export default OptionsPanel
