'use client'
import { useRef } from 'react'
import { TextOverlay } from './TextOverlay'
import type { Position } from '@/hooks/useDrag'

interface OverlayProps {
  nome: string
  rua: string
  numero: string
  color: string
  fontSize: number
}

interface Props {
  imageSrc: string
  position: Position | null
  onPlace: (pos: Position) => void
  onDrag: (pos: Position) => void
  overlayProps: OverlayProps
}

export function FlyerPreview({ imageSrc, position, onPlace, onDrag, overlayProps }: Props) {
  const containerRef = useRef<HTMLDivElement>(null!)

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    onPlace({ x: e.clientX - rect.left - 60, y: e.clientY - rect.top - 20 })
  }

  return (
    <div className="space-y-3">
      <label className="text-label-md text-on-surface-variant flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-primary">touch_app</span>
        {position ? 'Arraste para ajustar a posição' : 'Clique no flyer para posicionar o endereço'}
      </label>

      <div
        ref={containerRef}
        data-testid="flyer-wrapper"
        onClick={handleClick}
        className="relative rounded-2xl overflow-hidden shadow-[0px_4px_24px_rgba(93,46,192,0.12)] border border-[#EFEFEF]"
        style={{ cursor: position ? 'default' : 'crosshair' }}
      >
        <img
          data-testid="flyer-image"
          src={imageSrc}
          alt="Flyer"
          className="w-full block rounded-2xl"
        />

        {!position ? (
          <div
            data-testid="click-hint"
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            <span className="material-symbols-outlined text-5xl text-white/70 mb-2">touch_app</span>
            <span className="text-white/80 text-sm font-semibold bg-black/30 px-3 py-1 rounded-full">
              Clique para posicionar
            </span>
          </div>
        ) : (
          <TextOverlay
            {...overlayProps}
            position={position}
            onDrag={onDrag}
            containerRef={containerRef}
          />
        )}
      </div>
    </div>
  )
}
