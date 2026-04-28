'use client'
import React, { useRef } from 'react'
import { TextOverlay } from './TextOverlay'
import type { Position } from '@/hooks/useDrag'

interface OverlayProps {
  nome: string
  rua: string
  numero: string
  color: string
  fontSize: number
  fontFamily: string
  textAlign: 'left' | 'center' | 'right'
}

interface Props {
  imageSrc: string
  position: Position | null
  onPlace: (pos: Position) => void
  onDrag: (pos: Position) => void
  overlayProps: OverlayProps
  extraTexts: Array<{
    id: string
    text: string
    position: { x: number; y: number }
    fontSize: number
    color: string
    fontFamily: string
    textAlign: 'left' | 'center' | 'right'
  }>
  selectedId: string
  onSelect: (id: string) => void
  onUpdateExtraText: (id: string, updated: any) => void
  onFontSizeChange?: (size: number) => void
}

export function FlyerPreview({
  imageSrc,
  position,
  onPlace,
  onDrag,
  overlayProps,
  extraTexts,
  selectedId,
  onSelect,
  onUpdateExtraText,
  onFontSizeChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    onPlace({ x, y })
  }

  return (
    <div className="space-y-3">
      <label className="text-label-md text-on-surface-variant flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-primary">touch_app</span>
        {position ? 'Arraste para ajustar a posição' : 'Clique no flyer para posicionar o endereço'}
      </label>

      <div className="relative rounded-2xl overflow-hidden shadow-[0px_4px_24px_rgba(93,46,192,0.12)] border border-[#EFEFEF]">
        <div
          ref={containerRef}
          data-testid="flyer-canvas"
          onClick={handleClick}
          className="relative"
          style={{ cursor: position ? 'default' : 'crosshair' }}
        >
          <img
            data-testid="flyer-image"
            src={imageSrc}
            alt="Flyer"
            className="w-full block"
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
        ) : null}

        {position && (
          <TextOverlay
            {...overlayProps}
            position={position}
            onDrag={onDrag}
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
            isSelected={selectedId === 'address'}
            onClick={() => onSelect('address')}
            onFontSizeChange={onFontSizeChange}
          />
        )}

        {extraTexts.map((text) => (
          <TextOverlay
            key={text.id}
            nome={text.text}
            rua=""
            numero=""
            color={text.color}
            fontSize={text.fontSize}
            fontFamily={text.fontFamily}
            textAlign={text.textAlign}
            position={text.position}
            isSelected={selectedId === text.id}
            onClick={() => onSelect(text.id)}
            onDrag={(pos) => onUpdateExtraText(text.id, { position: pos })}
            onFontSizeChange={(size) => onUpdateExtraText(text.id, { fontSize: size })}
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
          />
        ))}
        </div>
      </div>
    </div>
  )
}
