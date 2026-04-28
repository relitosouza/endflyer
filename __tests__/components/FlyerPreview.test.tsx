import { render, screen, fireEvent } from '@testing-library/react'
import { FlyerPreview } from '@/components/FlyerPreview'
import type { Position } from '@/hooks/useDrag'

const overlayProps = { nome: 'João', rua: 'Rua A', numero: '1', color: '#fff', fontSize: 18 }

describe('FlyerPreview', () => {
  it('exibe a imagem do flyer', () => {
    render(<FlyerPreview imageSrc="data:image/png;base64,abc" position={null} onPlace={jest.fn()} onDrag={jest.fn()} overlayProps={overlayProps} />)
    expect(screen.getByTestId('flyer-image')).toBeInTheDocument()
  })

  it('mostra hint quando não há posição', () => {
    render(<FlyerPreview imageSrc="data:image/png;base64,abc" position={null} onPlace={jest.fn()} onDrag={jest.fn()} overlayProps={overlayProps} />)
    expect(screen.getByTestId('click-hint')).toBeInTheDocument()
  })

  it('oculta hint quando há posição', () => {
    const pos: Position = { x: 10, y: 20 }
    render(<FlyerPreview imageSrc="data:image/png;base64,abc" position={pos} onPlace={jest.fn()} onDrag={jest.fn()} overlayProps={overlayProps} />)
    expect(screen.queryByTestId('click-hint')).not.toBeInTheDocument()
  })

  it('chama onPlace ao clicar no wrapper', () => {
    const onPlace = jest.fn()
    render(<FlyerPreview imageSrc="data:image/png;base64,abc" position={null} onPlace={onPlace} onDrag={jest.fn()} overlayProps={overlayProps} />)
    const wrapper = screen.getByTestId('flyer-wrapper')
    fireEvent.click(wrapper, { clientX: 100, clientY: 150 })
    expect(onPlace).toHaveBeenCalledWith(expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }))
  })
})
