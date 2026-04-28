import { render, screen } from '@testing-library/react'
import { TextOverlay } from '@/components/TextOverlay'
import type { Position } from '@/hooks/useDrag'

const defaultProps = {
  nome: 'João da Silva',
  rua: 'Rua das Flores',
  numero: '123',
  color: '#ffffff',
  fontSize: 18,
  position: { x: 50, y: 100 } as Position,
  onDrag: jest.fn(),
  containerRef: { current: null } as React.RefObject<HTMLDivElement>,
}

describe('TextOverlay', () => {
  it('renderiza nome em negrito', () => {
    render(<TextOverlay {...defaultProps} />)
    const nome = screen.getByText('João da Silva')
    expect(nome).toBeInTheDocument()
    expect(nome).toHaveStyle({ fontWeight: '700' })
  })

  it('renderiza rua e número na segunda linha', () => {
    render(<TextOverlay {...defaultProps} />)
    expect(screen.getByText('Rua das Flores, 123')).toBeInTheDocument()
  })

  it('aplica a cor do texto', () => {
    render(<TextOverlay {...defaultProps} color="#ff0000" />)
    const nome = screen.getByText('João da Silva')
    expect(nome).toHaveStyle({ color: '#ff0000' })
  })

  it('aplica o tamanho de fonte no nome', () => {
    render(<TextOverlay {...defaultProps} fontSize={24} />)
    const nome = screen.getByText('João da Silva')
    expect(nome).toHaveStyle({ fontSize: '24px' })
  })

  it('posiciona no local correto', () => {
    render(<TextOverlay {...defaultProps} position={{ x: 50, y: 100 }} />)
    const el = screen.getByTestId('text-overlay')
    expect(el).toHaveStyle({ left: '50px', top: '100px' })
  })
})
