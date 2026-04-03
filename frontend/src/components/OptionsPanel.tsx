import { useEffect, useState } from 'react'
import type { ChangeEvent, RefObject } from 'react'
import { FileUp, Loader2, Plus, X, CalendarDays, Menu } from 'lucide-react'
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
  onOpenCalendar: () => void
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  fileInputRef: RefObject<HTMLInputElement | null>
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const OptionsPanel = ({
  status,
  isLoading = false,
  onImportClick,
  onOpenCalendar,
  onFileChange,
  fileInputRef,
  isCollapsed,
  onToggleCollapse,
}: OptionsPanelProps) => {
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
    <aside className={`panel right${isCollapsed ? ' is-collapsed' : ''}`}>
      <div className="panel-header">
        <span>OPTIONS</span>
        <button
          type="button"
          className="panel-toggle"
          onClick={onToggleCollapse}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand options panel' : 'Collapse options panel'}
        >
          <Menu size={18} />
        </button>
      </div>

      {isCollapsed && (
        <div className="options-collapsed">
          <button
            type="button"
            className={`options-collapsed-icon primary${isLoading ? ' loading' : ''}`}
            onClick={!isLoading ? onImportClick : undefined}
            aria-label="Import PDF"
            aria-disabled={isLoading}
          >
            {isLoading ? <Loader2 size={18} className="spin" /> : <FileUp size={18} />}
          </button>

          <button
            type="button"
            className="options-collapsed-icon secondary"
            onClick={onOpenCalendar}
            aria-label="Open calendar"
          >
            <CalendarDays size={18} />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={onFileChange}
        hidden
      />

      <div className="panel-body" aria-hidden={isCollapsed}>
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
            <h3>{isLoading ? 'Importing…' : 'Upload a document to enhance context'}</h3>
          </div>
        </button>

        {status && <p className="option-status">{status}</p>}

        <button className="option-card secondary" onClick={onOpenCalendar} role="button">
          <div className="option-icon">
            <CalendarDays size={20} />
          </div>
          <div>
            <h3>Open Calendar</h3>
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
      </div>
    </aside>
  )
}

export default OptionsPanel
