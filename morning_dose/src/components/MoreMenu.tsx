/*
Three-dot (⋯) menu in the header.

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import './MoreMenu.css'
import { useEffect, useRef, useState } from 'react'

type Item = { label: string; onSelect: () => void }

export function MoreMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="more" ref={ref}>
      <button
        className="round-btn"
        aria-label="More"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="17" height="4" viewBox="0 0 17 4" aria-hidden>
          <circle cx="2" cy="2" r="1.75" fill="currentColor" />
          <circle cx="8.5" cy="2" r="1.75" fill="currentColor" />
          <circle cx="15" cy="2" r="1.75" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div className="more-menu" role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
