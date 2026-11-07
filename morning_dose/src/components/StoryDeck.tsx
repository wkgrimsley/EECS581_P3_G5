/*
Swipeable story deck (Sprint 1 Story 6 / backlog #6).

Topics are a stack of cards. Swipe the top card away in ANY direction to
reveal the next topic; it flies off the way you threw it.
Go back by tapping a segment in the progress bar or pressing the left arrow key.

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { TOPICS } from '../topics/registry'
import type { Preferences, TopicId } from '../types'
import { StoryCard } from './StoryCard'
import './StoryDeck.css'

const SWIPE_DISTANCE = 0.28 // fraction of the card's shorter side
const FLICK_VELOCITY = 0.55 // px per ms — a quick flick also counts
const STACK_DEPTH = 2 // cards visible underneath the top one

type Point = { x: number; y: number }
type Exit = Point & { rotate: number }

type Props = {
  topics: TopicId[]
  prefs: Preferences
  onOpenPreferences: () => void
}

export function StoryDeck({ topics, prefs, onOpenPreferences }: Props) {
  const count = topics.length + 1 // last card is the "that's everything" card
  const [index, setIndex] = useState(0)
  const current = Math.min(index, count - 1)
  const [exits, setExits] = useState<Record<number, Exit>>({})
  const [drag, setDrag] = useState<Point | null>(null)
  const [size, setSize] = useState({ w: 360, h: 560 })

  const deckRef = useRef<HTMLDivElement>(null)
  // Live gesture data kept in a ref (not state) so a very fast flick — where the
  // finger lifts before React re-renders — still has its offset when it ends.
  // x/y: start point; dx/dy: current offset; lx/ly/lt: latest sample (for flick speed)
  const gesture = useRef<
    (Point & { active: boolean; dx: number; dy: number; lx: number; ly: number; lt: number; speed: number }) | null
  >(null)
  const didDrag = useRef(false)

  // Card leaves along (dx, dy); far enough to clear the screen in any direction
  const exitFor = (dx: number, dy: number): Exit => {
    const len = Math.hypot(dx, dy) || 1
    const dist = Math.hypot(size.w, size.h) * 1.4
    return { x: (dx / len) * dist, y: (dy / len) * dist, rotate: (dx / len) * 18 }
  }

  const goTo = (target: number) => {
    const i = Math.max(0, Math.min(count - 1, target))
    if (i > current) {
      // Cards skipped with keys/progress bar leave to the left
      setExits((prev) => {
        const next = { ...prev }
        for (let k = current; k < i; k++) next[k] = exitFor(-1, -0.15)
        return next
      })
    }
    setIndex(i)
  }

  useEffect(() => {
    const el = deckRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select')) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goTo(current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // ---- Gesture ----
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    gesture.current = { x: e.clientX, y: e.clientY, active: false, dx: 0, dy: 0, lx: e.clientX, ly: e.clientY, lt: performance.now(), speed: 0 }
    didDrag.current = false
  }

  // Move/up are tracked on the whole window, not just the deck, so a fast drag
  // that leaves the card area in one step is still seen.
  const onPointerMove = (e: PointerEvent) => {
    const g = gesture.current
    if (!g) return
    const dx = e.clientX - g.x
    const dy = e.clientY - g.y
    const now = performance.now()
    g.speed = Math.hypot(e.clientX - g.lx, e.clientY - g.ly) / Math.max(1, now - g.lt)
    g.lx = e.clientX
    g.ly = e.clientY
    g.lt = now
    if (!g.active) {
      if (Math.hypot(dx, dy) < 8) return
      g.active = true
      didDrag.current = true
    }
    // The last card can't be thrown away: resist instead
    const k = current === count - 1 ? 0.2 : 1
    g.dx = dx * k
    g.dy = dy * k
    setDrag({ x: g.dx, y: g.dy })
  }

  const onPointerUp = () => {
    const g = gesture.current
    gesture.current = null
    if (!g || !g.active) return
    const dist = Math.hypot(g.dx, g.dy)
    // only count a flick if the finger was still moving fast when it let go
    const velocity = performance.now() - g.lt < 100 ? g.speed : 0
    const thrown = dist > Math.min(size.w, size.h) * SWIPE_DISTANCE || velocity > FLICK_VELOCITY
    if (thrown && current < count - 1) {
      setExits((prev) => ({ ...prev, [current]: exitFor(g.dx, g.dy) }))
      setIndex(current + 1)
    }
    setDrag(null)
  }

  const handlers = useRef({ move: onPointerMove, up: onPointerUp })
  useEffect(() => {
    handlers.current = { move: onPointerMove, up: onPointerUp }
  })
  useEffect(() => {
    const move = (e: PointerEvent) => handlers.current.move(e)
    const up = () => handlers.current.up()
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [])

  // A drag shouldn't also count as a click on a link inside the card
  const onClickCapture = (e: React.MouseEvent) => {
    if (didDrag.current) {
      e.preventDefault()
      e.stopPropagation()
      didDrag.current = false
    }
  }

  // ---- Card positions ----
  const cardStyle = (i: number): CSSProperties => {
    const rel = i - current
    let transform = 'none'
    let opacity = 1

    if (rel < 0) {
      const ex = exits[i] ?? exitFor(-1, -0.15)
      transform = `translate(${ex.x}px, ${ex.y}px) rotate(${ex.rotate}deg)`
      opacity = 0
    } else if (rel === 0 && drag) {
      transform = `translate(${drag.x}px, ${drag.y}px) rotate(${(drag.x / size.w) * 14}deg)`
    } else if (rel > 0) {
      // Waiting underneath; the next card rises as the top one is pulled away
      const pull = drag ? Math.min(1, Math.hypot(drag.x, drag.y) / (Math.min(size.w, size.h) * SWIPE_DISTANCE * 1.5)) : 0
      const depth = Math.max(0, rel - pull)
      transform = `translateY(${depth * 10}px) scale(${1 - depth * 0.045})`
      opacity = rel > STACK_DEPTH ? 0 : 1 - depth * 0.25
    }

    return {
      transform,
      opacity,
      zIndex: count - i,
      transition: drag && rel === 0 ? 'none' : undefined,
    }
  }

  const atEnd = current === topics.length

  return (
    <div className="deck-wrap">
      <div className="progress" role="tablist" aria-label="Topics">
        {topics.map((id, i) => (
          <button
            key={id}
            role="tab"
            aria-selected={i === current}
            aria-label={TOPICS[id].label}
            className={i < current ? 'seg seen' : i === current ? 'seg current' : 'seg'}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <div
        ref={deckRef}
        className={drag ? 'deck dragging' : 'deck'}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()} // stop native link/image dragging
      >
        {topics.map((id, i) => {
          const hidden = i !== current
          return (
            <div key={id} className="deck-slot" style={cardStyle(i)} aria-hidden={hidden} inert={hidden}>
              <StoryCard topic={TOPICS[id]} prefs={prefs} />
            </div>
          )
        })}

        <div className="deck-slot" style={cardStyle(topics.length)} aria-hidden={!atEnd} inert={!atEnd}>
          <article className="story-card end-card">
            <div className="end-content">
              {topics.length === 0 ? (
                <>
                  <h2>Nothing to show</h2>
                  <p className="muted">Turn on at least one topic to build your snapshot.</p>
                </>
              ) : (
                <>
                  <h2>That’s everything for today</h2>
                  <p className="muted">New stories, scores, and prices load each time you open the app.</p>
                </>
              )}
              <div className="end-actions">
                {topics.length > 0 && <button className="button" onClick={() => goTo(0)}>Start over</button>}
                <button className="button secondary" onClick={onOpenPreferences}>Edit preferences</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
