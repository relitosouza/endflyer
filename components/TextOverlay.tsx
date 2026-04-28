'use client'
import { useRef, useEffect } from 'react'
import type { Position } from '@/hooks/useDrag'

interface Props {
  nome: string
  rua: string
  numero: string
  color: string
  fontSize: number
  position: Position
  onDrag: (pos: Position) => void
  containerRef: React.RefObject<HTMLDivElement>
}

export function TextOverlay({ nome, rua, numero, color, fontSize, position, onDrag, containerRef }: Props) {
  const dragOffset = useRef({ x: 0, y: 0 })
  const overlayRef = useRef<HTMLDivElement>(null)
  // Keep refs to latest values so the passive touchstart handler always uses current data
  const positionRef = useRef(position)
  positionRef.current = position
  const onDragRef = useRef(onDrag)
  onDragRef.current = onDrag

  function handleMouseDown(e: React.MouseEvent) {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    dragOffset.current = {
      x: e.clientX - rect.left - position.x,
      y: e.clientY - rect.top - position.y,
    }
    e.stopPropagation()
    e.preventDefault()

    function onMove(ev: MouseEvent) {
      if (!containerRef.current) return
      const r = containerRef.current.getBoundingClientRect()
      onDrag({
        x: ev.clientX - r.left - dragOffset.current.x,
        y: ev.clientY - r.top - dragOffset.current.y,
      })
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // Attach touchstart with passive:false via native addEventListener so preventDefault works.
  // React's synthetic onTouchStart is passive by default in React 17+, blocking preventDefault.
  useEffect(() => {
    const el = overlayRef.current
    if (!el) return

    function onTouchStart(e: TouchEvent) {
      if (!containerRef.current) return
      const touch = e.touches[0]
      const rect = containerRef.current.getBoundingClientRect()
      dragOffset.current = {
        x: touch.clientX - rect.left - positionRef.current.x,
        y: touch.clientY - rect.top - positionRef.current.y,
      }
      e.stopPropagation()
      e.preventDefault()

      function onTouchMove(ev: TouchEvent) {
        if (!containerRef.current) return
        const t = ev.touches[0]
        const r = containerRef.current.getBoundingClientRect()
        onDragRef.current({
          x: t.clientX - r.left - dragOffset.current.x,
          y: t.clientY - r.top - dragOffset.current.y,
        })
        ev.preventDefault()
      }

      function onTouchEnd() {
        document.removeEventListener('touchmove', onTouchMove)
        document.removeEventListener('touchend', onTouchEnd)
      }

      document.addEventListener('touchmove', onTouchMove, { passive: false })
      document.addEventListener('touchend', onTouchEnd)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    return () => el.removeEventListener('touchstart', onTouchStart)
  }, [containerRef]) // attach once; uses refs for position/onDrag

  return (
    <div
      ref={overlayRef}
      data-testid="text-overlay"
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      style={{ position: 'absolute', left: position.x, top: position.y }}
      className="cursor-grab active:cursor-grabbing select-none px-2 py-1 border-2 border-dashed border-[rgba(109,63,207,0.7)] rounded-md bg-[rgba(109,63,207,0.06)]"
    >
      <div style={{ fontWeight: 700, fontSize: `${fontSize}px`, color, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
        {nome}
      </div>
      <div style={{ fontWeight: 400, fontSize: '14px', color, lineHeight: 1.4, whiteSpace: 'nowrap' }}>
        {[rua, numero].filter(Boolean).join(', ')}
      </div>
    </div>
  )
}
