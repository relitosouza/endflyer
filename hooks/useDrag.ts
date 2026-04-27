'use client'
import { useState, useCallback } from 'react'

export interface Position { x: number; y: number }

export function useDrag() {
  const [position, setPosition] = useState<Position | null>(null)
  const reset = useCallback(() => setPosition(null), [])
  return { position, setPosition, reset }
}
