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
  textAlign: 'left' | 'center' | 'right'
  position: Position
  onDrag: (pos: Position) => void
  containerRef: React.RefObject<HTMLDivElement>
  isSelected?: boolean
  onClick?: () => void
  onFontSizeChange?: (size: number) => void
}

export function TextOverlay({ nome, rua, numero, color, fontSize, fontFamily, textAlign, position, onDrag, containerRef, isSelected, onClick, onFontSizeChange }: Props) {
  const dragOffset = useRef({ x: 0, y: 0 })
  const overlayRef = useRef<HTMLDivElement>(null)
  // Keep refs to latest values so the passive touchstart handler always uses current data
  const positionRef = useRef(position)
  positionRef.current = position
  const onDragRef = useRef(onDrag)
  onDragRef.current = onDrag
  const fontSizeRef = useRef(fontSize)
  fontSizeRef.current = fontSize
  const onFontSizeChangeRef = useRef(onFontSizeChange)
  onFontSizeChangeRef.current = onFontSizeChange
  const onClickRef = useRef(onClick)
  onClickRef.current = onClick

  const initialPinchDist = useRef<number>(0)
  const initialFontSizeState = useRef<number>(0)

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
      
      onClickRef.current?.()
      
      initialPinchDist.current = 0
      
      if (e.touches.length === 1) {
        const touch = e.touches[0]
        const rect = containerRef.current.getBoundingClientRect()
        const currentX = (positionRef.current.x / 100) * rect.width
        const currentY = (positionRef.current.y / 100) * rect.height
        dragOffset.current = {
          x: (touch.clientX - rect.left) - currentX,
          y: (touch.clientY - rect.top) - currentY,
        }
      }
      
      e.stopPropagation()
      e.preventDefault()

      function onTouchMove(ev: TouchEvent) {
        if (!containerRef.current) return
        
        if (ev.touches.length === 2 && onFontSizeChangeRef.current) {
          const touch1 = ev.touches[0]
          const touch2 = ev.touches[1]
          const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
          
          if (initialPinchDist.current === 0) {
            initialPinchDist.current = dist
            initialFontSizeState.current = fontSizeRef.current
          } else {
            const factor = dist / initialPinchDist.current
            const newSize = Math.round(initialFontSizeState.current * factor)
            const clampedSize = Math.max(10, Math.min(100, newSize))
            onFontSizeChangeRef.current(clampedSize)
          }
          ev.preventDefault()
        } else if (ev.touches.length === 1) {
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
      }

      function onTouchEnd(ev: TouchEvent) {
        if (ev.touches.length === 0) {
          document.removeEventListener('touchmove', onTouchMove)
          document.removeEventListener('touchend', onTouchEnd)
        } else if (ev.touches.length === 1) {
          if (containerRef.current) {
            const touch = ev.touches[0]
            const rect = containerRef.current.getBoundingClientRect()
            const currentX = (positionRef.current.x / 100) * rect.width
            const currentY = (positionRef.current.y / 100) * rect.height
            dragOffset.current = {
              x: (touch.clientX - rect.left) - currentX,
              y: (touch.clientY - rect.top) - currentY,
            }
          }
          initialPinchDist.current = 0
        }
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
      className={`cursor-grab active:cursor-grabbing select-none px-3 py-1.5 border-2 rounded-xl transition-all
        ${isSelected 
          ? 'border-violet-600 bg-transparent z-30' 
          : 'border-transparent bg-transparent hover:border-violet-300/50'
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
