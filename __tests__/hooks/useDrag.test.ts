import { renderHook, act } from '@testing-library/react'
import { useDrag } from '@/hooks/useDrag'

describe('useDrag', () => {
  it('retorna posição inicial como null', () => {
    const { result } = renderHook(() => useDrag())
    expect(result.current.position).toBeNull()
  })

  it('setPosition atualiza a posição', () => {
    const { result } = renderHook(() => useDrag())
    act(() => { result.current.setPosition({ x: 100, y: 200 }) })
    expect(result.current.position).toEqual({ x: 100, y: 200 })
  })

  it('reset volta posição para null', () => {
    const { result } = renderHook(() => useDrag())
    act(() => { result.current.setPosition({ x: 50, y: 50 }) })
    act(() => { result.current.reset() })
    expect(result.current.position).toBeNull()
  })
})
