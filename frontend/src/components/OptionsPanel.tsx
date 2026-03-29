import { useEffect, useState } from 'react'
import type { ChangeEvent, RefObject } from 'react'
import { FileUp, Trash2, Loader2, AlertTriangle, Plus, X } from 'lucide-react'
import {
  addRoadmapItem,
  deleteRoadmapItem,
  fetchRoadmap,
  type RoadmapItem
} from '../services/roadmapService'
import './Panel.css'
import './OptionsPanel.css'

type OptionsPanelProps = {
  status?: string
  isLoading?: boolean
  onImportClick: () => void
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  fileInputRef: RefObject<HTMLInputElement | null>
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
  const [roadmapInput, setRoadmapInput] = useState('')
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([])
  const [roadmapLoading, setRoadmapLoading] = useState(true)
  const [roadmapSaving, setRoadmapSaving] = useState(false)
  const [roadmapError, setRoadmapError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const load = async () => {
      try {
        const items = await fetchRoadmap()

        if (isActive) {
          setRoadmapItems(items)
          setRoadmapError(null)
        }
      } catch (error) {
        console.error(error)
        if (isActive) {
          setRoadmapError('Failed to load roadmap.')
        }
      } finally {
        if (isActive) {
          setRoadmapLoading(false)
        }
      }
    }

    load()

    return () => {
      isActive = false
    }
  }, [])

  const handleClearClick = () => {
    if (confirmClear) {
      onClear()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
    }
  }

  const handleAddRoadmapItem = async () => {
    const trimmed = roadmapInput.trim()
    if (!trimmed) return

    setRoadmapSaving(true)

    try {
      const created = await addRoadmapItem(trimmed)
      setRoadmapItems((items) => [created, ...items])
      setRoadmapInput('')
      setRoadmapError(null)
    } catch (error) {
      console.error(error)
      setRoadmapError('Failed to save item.')
    } finally {
      setRoadmapSaving(false)
    }
  }

  return (
    <aside className="panel right">
      <div className="panel-header">OPTIONS</div>

      <button
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
      </button>

      {status && <p className="option-status">{status}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={onFileChange}
        hidden
      />

      <button
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
      </button>

      <section className="roadmap-card">
        <div className="roadmap-header">
          <h3>Roadmap</h3>
          <p>Features you want later</p>
        </div>

        <form
          className="roadmap-form"
          onSubmit={(event) => {
            event.preventDefault()
            handleAddRoadmapItem()
          }}
        >
          <input
            type="text"
            value={roadmapInput}
            onChange={(event) => setRoadmapInput(event.target.value)}
            placeholder="Add a functionality"
            aria-label="Add a functionality"
            disabled={roadmapLoading || roadmapSaving}
          />

          <button
            type="submit"
            className="roadmap-add"
            aria-label="Add functionality"
            disabled={roadmapLoading || roadmapSaving}
          >
            <Plus size={16} />
            {roadmapSaving ? 'Saving' : 'Add'}
          </button>
        </form>

        <ul className="roadmap-list">
          {roadmapLoading ? (
            <li className="roadmap-empty">Loading roadmap…</li>
          ) : roadmapItems.length === 0 ? (
            <li className="roadmap-empty">No ideas yet</li>
          ) : (
            roadmapItems.map((item) => (
              <li key={item.id} className="roadmap-item">
                <span>{item.text}</span>

                <button
                  type="button"
                  className="roadmap-remove"
                  onClick={async () => {
                    try {
                      const ok = await deleteRoadmapItem(item.id)

                      if (ok) {
                        setRoadmapItems((items) =>
                          items.filter((entry) => entry.id !== item.id)
                        )
                      }
                    } catch (error) {
                      console.error(error)
                      setRoadmapError('Failed to remove item.')
                    }
                  }}
                  aria-label={`Remove ${item.text}`}
                >
                  <X size={14} />
                </button>
              </li>
            ))
          )}
        </ul>

        {roadmapError && <p className="roadmap-error">{roadmapError}</p>}
      </section>
    </aside>
  )
}

export default OptionsPanel