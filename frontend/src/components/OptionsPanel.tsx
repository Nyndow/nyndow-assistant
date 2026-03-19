import type { ChangeEvent, RefObject } from 'react'


type OptionsPanelProps = {
  status: string
  onImportClick: () => void
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  fileInputRef: RefObject<HTMLInputElement>
  useDocs: boolean
  onUseDocsChange: (next: boolean) => void
}

const OptionsPanel = ({
  status,
  onImportClick,
  onFileChange,
  onClear,
  fileInputRef,
  useDocs,
  onUseDocsChange,
}: OptionsPanelProps) => {
  return (
    <aside className="panel right">
      <div className="panel-header">OPTIONS</div>
      <label className="option-toggle">
        <input
          type="checkbox"
          checked={useDocs}
          onChange={(event) => onUseDocsChange(event.target.checked)}
        />
        <span>Use docs (RAG)</span>
      </label>
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
