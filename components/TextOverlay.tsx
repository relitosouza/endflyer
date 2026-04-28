'use client'
import { useRef } from 'react'
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

  function handleTouchStart(e: React.TouchEvent) {
    if (!containerRef.current) return
    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    dragOffset.current = {
      x: touch.clientX - rect.left - position.x,
      y: touch.clientY - rect.top - position.y,
    }
    e.stopPropagation()
    e.preventDefault()

    function onTouchMove(ev: TouchEvent) {
      if (!containerRef.current) return
      const t = ev.touches[0]
      const r = containerRef.current.getBoundingClientRect()
      onDrag({
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

  return (
    <div
      data-testid="text-overlay"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{ position: 'absolute', left: position.x, top: position.y }}
      className="cursor-grab active:cursor-grabbing select-none px-2 py-1 border-2 border-dashed border-[rgba(109,63,207,0.7)] rounded-md bg-[rgba(109,63,207,0.06)]"
    >
      <div style={{ fontWeight: 700, fontSize: `${fontSize}px`, color, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
        {nome}
      </div>
      <div style={{ fontWeight: 400, fontSize: '14px', color, lineHeight: 1.4, whiteSpace: 'nowrap' }}>
        {rua}, {numero}
      </div>
    </div>
  )
}
