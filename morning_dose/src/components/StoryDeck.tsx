/*
Swipeable story deck (Sprint 1 Story 6, backlog #6)

Each topic is a card in a stack. You swipe the top card away in any direction
to get to the next topic, and it flies off whichever way you threw it.
Swiping works with touch, click and drag, and two finger swipes on a trackpad.
To go back you can tap a topic's name in the tabs at the top or use the arrow keys.
If a card has more stuff than fits (like a long Notes card), dragging up or
down scrolls it instead of throwing it. Swiping sideways still throws it.

Author: Jamareon Davis
Creation Date: 2026-11-06
*/
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { TOPICS } from '../topics/registry'
import type { Preferences, TopicId } from '../types'
import { StoryCard } from './StoryCard'
import './StoryDeck.css'

const SWIPE_DISTANCE = 0.28 // how far you have to drag, as a fraction of the card size
const FLICK_VELOCITY = 0.55 // px per ms, a fast flick counts even if it's short
const STACK_DEPTH = 2 // how many cards you can see under the top one
const WHEEL_DISTANCE = 80 // how much trackpad or mouse wheel scrolling throws a card
const WHEEL_SETTLE_MS = 150 // wait this long after a throw so trackpad momentum doesn't skip cards

type Point = { x: number; y: number }
type Exit = Point & { rotate: number }

type Props = {
  topics: TopicId[]
  prefs: Preferences
  onOpenPreferences: () => void
}

export function StoryDeck({ topics, prefs, onOpenPreferences }: Props) {
  const count = topics.length + 1 // +1 for the "that's everything" card at the end
  const [index, setIndex] = useState(0)
  const current = Math.min(index, count - 1)
  const [exits, setExits] = useState<Record<number, Exit>>({})
  const [drag, setDrag] = useState<Point | null>(null)
  const [size, setSize] = useState({ w: 360, h: 560 })

  const deckRef = useRef<HTMLDivElement>(null)
  // Info about the swipe that's happening right now. This is a ref instead of state
  // so a really fast flick still works even if React hasn't re-rendered yet.
  // x/y = where it started, dx/dy = how far it's moved, lx/ly/lt = last spot (for speed)
  // mode starts as 'pending' and turns into 'drag' (throw the card) or
  // 'scroll' (scroll a card that has more than fits) once you move a bit
  // body/startScroll = the card's scrolling area if it has more than fits
  const gesture = useRef<
    | (Point & {
        mode: 'pending' | 'drag' | 'scroll'
        body: HTMLElement | null
        startScroll: number
        dx: number
        dy: number
        lx: number
        ly: number
        lt: number
        speed: number
      })
    | null
  >(null)
  const didDrag = useRef(false)

  // where a card goes when it's thrown, far enough to be off screen in any direction
  const exitFor = (dx: number, dy: number): Exit => {
    const len = Math.hypot(dx, dy) || 1
    const dist = Math.hypot(size.w, size.h) * 1.4
    return { x: (dx / len) * dist, y: (dy / len) * dist, rotate: (dx / len) * 18 }
  }

  const goTo = (target: number) => {
    const i = Math.max(0, Math.min(count - 1, target))
    if (i > current) {
      // cards skipped with the tabs or arrow keys just fly off to the left
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

  // Swiping
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    // if you're selecting text in a text box with the mouse (like on the Notes card) don't swipe
    // on touch screens swiping still works from a text box, and tapping one still opens it
    if (e.pointerType === 'mouse' && (e.target as HTMLElement).closest('input, textarea, select')) return
    const area = (e.target as HTMLElement).closest('.story-body') as HTMLElement | null
    const body = area && area.scrollHeight > area.clientHeight + 1 ? area : null
    gesture.current = {
      x: e.clientX,
      y: e.clientY,
      mode: 'pending',
      body,
      startScroll: body?.scrollTop ?? 0,
      dx: 0,
      dy: 0,
      lx: e.clientX,
      ly: e.clientY,
      lt: performance.now(),
      speed: 0,
    }
    didDrag.current = false
  }

  // we listen for move/up on the whole window, not just the deck, so a fast drag
  // that jumps off the card still counts
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
    if (g.mode === 'pending') {
      if (Math.hypot(dx, dy) < 8) return
      // if the card has more than fits and you're moving mostly up or down, scroll it
      g.mode = g.body && Math.abs(dy) > Math.abs(dx) ? 'scroll' : 'drag'
      didDrag.current = true
    }
    if (g.mode === 'scroll') {
      if (g.body) g.body.scrollTop = g.startScroll - dy
      return
    }
    // you can't throw the last card away, so it just moves a little and bounces back
    const k = current === count - 1 ? 0.2 : 1
    g.dx = dx * k
    g.dy = dy * k
    setDrag({ x: g.dx, y: g.dy })
  }

  const onPointerUp = () => {
    const g = gesture.current
    gesture.current = null
    if (!g || g.mode !== 'drag') return
    const dist = Math.hypot(g.dx, g.dy)
    // only counts as a flick if you were still moving fast when you let go
    const velocity = performance.now() - g.lt < 100 ? g.speed : 0
    const thrown = dist > Math.min(size.w, size.h) * SWIPE_DISTANCE || velocity > FLICK_VELOCITY
    if (thrown && current < count - 1) {
      setExits((prev) => ({ ...prev, [current]: exitFor(g.dx, g.dy) }))
      setIndex(current + 1)
    }
    setDrag(null)
  }

  // Trackpad and mouse wheel
  // a two finger swipe on a laptop trackpad shows up as scroll ("wheel") events, not a drag,
  // so we add up the scrolling and once it's past WHEEL_DISTANCE we throw the card that way
  const wheel = useRef({ x: 0, y: 0, t: 0, settling: false })
  const onWheel = (e: WheelEvent) => {
    // let a card with more stuff scroll normally first
    const body = (e.target as HTMLElement).closest('.story-body') as HTMLElement | null
    if (body && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const canScroll = e.deltaY > 0 ? body.scrollTop + body.clientHeight < body.scrollHeight - 1 : body.scrollTop > 0
      if (canScroll) return
    }
    e.preventDefault()

    const w = wheel.current
    const now = performance.now()
    const gap = now - w.t
    w.t = now
    // after a throw, ignore the leftover trackpad momentum until it stops
    if (w.settling) {
      if (gap < WHEEL_SETTLE_MS) return
      w.settling = false
    }
    if (gap > 250) {
      w.x = 0
      w.y = 0
    }
    w.x += e.deltaX
    w.y += e.deltaY
    if (Math.hypot(w.x, w.y) > WHEEL_DISTANCE) {
      if (current < count - 1) {
        // fingers go left, so deltaX is positive, so the card flies left
        setExits((prev) => ({ ...prev, [current]: exitFor(-w.x, -w.y) }))
        setIndex(current + 1)
      }
      w.x = 0
      w.y = 0
      w.settling = true
    }
  }

  const handlers = useRef({ move: onPointerMove, up: onPointerUp, wheel: onWheel })
  useEffect(() => {
    handlers.current = { move: onPointerMove, up: onPointerUp, wheel: onWheel }
  })
  useEffect(() => {
    const move = (e: PointerEvent) => handlers.current.move(e)
    const up = () => handlers.current.up()
    const wheelHandler = (e: WheelEvent) => handlers.current.wheel(e)
    const deck = deckRef.current
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    // passive: false so the whole page doesn't scroll while you swipe cards
    deck?.addEventListener('wheel', wheelHandler, { passive: false })
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      deck?.removeEventListener('wheel', wheelHandler)
    }
  }, [])

  // a drag shouldn't count as clicking a link inside the card
  const onClickCapture = (e: React.MouseEvent) => {
    if (didDrag.current) {
      e.preventDefault()
      e.stopPropagation()
      didDrag.current = false
    }
  }

  // Card positions
  const cardStyle = (i: number): CSSProperties => {
    const rel = i - current
    let transform = 'none'
    let opacity = 1
    let filter = 'none'

    if (rel < 0) {
      const ex = exits[i] ?? exitFor(-1, -0.15)
      transform = `translate(${ex.x}px, ${ex.y}px) rotate(${ex.rotate}deg)`
      opacity = 0
    } else if (rel === 0 && drag) {
      transform = `translate(${drag.x}px, ${drag.y}px) rotate(${(drag.x / size.w) * 14}deg)`
    } else if (rel > 0) {
      // cards waiting underneath, the next one grows as you pull the top one away
      const pull = drag ? Math.min(1, Math.hypot(drag.x, drag.y) / (Math.min(size.w, size.h) * SWIPE_DISTANCE * 1.5)) : 0
      const depth = Math.max(0, rel - pull)
      transform = `translateY(${depth * 10}px) scale(${1 - depth * 0.045})`
      // cards further down get darker (not see through, so you can't see the card behind)
      filter = `brightness(${1 - depth * 0.3})`
      opacity = rel > STACK_DEPTH ? 0 : 1
    }

    return {
      transform,
      opacity,
      filter,
      zIndex: count - i,
      transition: drag && rel === 0 ? 'none' : undefined,
    }
  }

  const atEnd = current === topics.length

  return (
    <div className="deck-wrap">
      {/* topic tabs, tap a name to go to that card. the line under each name shows where you are */}
      <div className="progress" role="tablist" aria-label="Topics">
        {topics.map((id, i) => (
          <button
            key={id}
            role="tab"
            aria-selected={i === current}
            aria-label={TOPICS[id].label}
            className={i < current ? 'seg seen' : i === current ? 'seg current' : 'seg'}
            onClick={() => goTo(i)}
          >
            <span className="seg-label">{TOPICS[id].label}</span>
            <span className="seg-bar" aria-hidden />
          </button>
        ))}
      </div>

      <div
        ref={deckRef}
        className={drag ? 'deck dragging' : 'deck'}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()} // stops the browser from dragging links/images
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
