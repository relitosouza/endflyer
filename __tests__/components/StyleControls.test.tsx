import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StyleControls } from '@/components/StyleControls'

describe('StyleControls', () => {
  it('renderiza color picker com valor inicial', () => {
    render(<StyleControls color="#ffffff" fontSize={18} onColorChange={jest.fn()} onFontSizeChange={jest.fn()} onReset={jest.fn()} />)
    expect(screen.getByTestId('color-picker')).toHaveValue('#ffffff')
  })

  it('chama onColorChange ao mudar cor', async () => {
    const onColorChange = jest.fn()
    render(<StyleControls color="#ffffff" fontSize={18} onColorChange={onColorChange} onFontSizeChange={jest.fn()} onReset={jest.fn()} />)
    const picker = screen.getByTestId('color-picker')
    await userEvent.type(picker, '#ff0000')
    expect(onColorChange).toHaveBeenCalled()
  })

  it('chama onReset ao clicar em Reposicionar', async () => {
    const onReset = jest.fn()
    render(<StyleControls color="#ffffff" fontSize={18} onColorChange={jest.fn()} onFontSizeChange={jest.fn()} onReset={onReset} />)
    await userEvent.click(screen.getByText('Reposicionar'))
    expect(onReset).toHaveBeenCalled()
  })
})
