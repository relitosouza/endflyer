'use client'
import { useRef, useEffect } from 'react'
import type { Position } from '@/hooks/useDrag'

interface Props {
  nome: string
  rua: string
  numero: string
  color: string
  fontSize: number
  fontFamily: string
  onDrag: (pos: Position) => void
  containerRef: React.RefObject<HTMLDivElement>
  isSelected?: boolean
  onClick?: () => void
}

export function TextOverlay({ nome, rua, numero, color, fontSize, fontFamily, textAlign, position, onDrag, containerRef, isSelected, onClick }: Props) {
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
    const currentX = (position.x / 100) * rect.width
    const currentY = (position.y / 100) * rect.height
    dragOffset.current = {
      x: (e.clientX - rect.left) - currentX,
      y: (e.clientY - rect.top) - currentY,
    }
    e.stopPropagation()
    e.preventDefault()

    function onMove(ev: MouseEvent) {
      if (!containerRef.current) return
      const r = containerRef.current.getBoundingClientRect()
      const absX = ev.clientX - r.left - dragOffset.current.x
      const absY = ev.clientY - r.top - dragOffset.current.y
      onDrag({
        x: (absX / r.width) * 100,
        y: (absY / r.height) * 100,
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
  useEffect(() => {
    const el = overlayRef.current
    if (!el) return

    function onTouchStart(e: TouchEvent) {
      if (!containerRef.current) return
      const touch = e.touches[0]
      const rect = containerRef.current.getBoundingClientRect()
      const currentX = (positionRef.current.x / 100) * rect.width
      const currentY = (positionRef.current.y / 100) * rect.height
      dragOffset.current = {
        x: (touch.clientX - rect.left) - currentX,
        y: (touch.clientY - rect.top) - currentY,
      }
      e.stopPropagation()
      e.preventDefault()

      function onTouchMove(ev: TouchEvent) {
        if (!containerRef.current) return
        const t = ev.touches[0]
        const r = containerRef.current.getBoundingClientRect()
        const absX = t.clientX - r.left - dragOffset.current.x
        const absY = t.clientY - r.top - dragOffset.current.y
        onDragRef.current({
          x: (absX / r.width) * 100,
          y: (absY / r.height) * 100,
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
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        fontFamily: fontFamily,
        textAlign: textAlign
      }}
      className={`cursor-grab active:cursor-grabbing select-none px-2 py-1 border-2 rounded-md transition-all
        ${isSelected 
          ? 'border-violet-600 bg-violet-500/20 shadow-md z-30' 
          : 'border-dashed border-[rgba(109,63,207,0.7)] bg-[rgba(109,63,207,0.06)]'
        }`}
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
