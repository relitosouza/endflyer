import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddressForm } from '@/components/AddressForm'

describe('AddressForm', () => {
  it('renderiza os três campos', () => {
    render(<AddressForm values={{ nome: '', rua: '', numero: '' }} onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText('Ex: João da Silva')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ex: Rua das Flores')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('123')).toBeInTheDocument()
  })

  it('chama onChange com campo correto ao digitar no nome', async () => {
    const onChange = jest.fn()
    render(<AddressForm values={{ nome: '', rua: '', numero: '' }} onChange={onChange} />)
    const input = screen.getByPlaceholderText('Ex: João da Silva')
    await userEvent.type(input, 'M')
    expect(onChange).toHaveBeenCalledWith('nome', 'M')
  })

  it('chama onChange com campo correto ao digitar na rua', async () => {
    const onChange = jest.fn()
    render(<AddressForm values={{ nome: '', rua: '', numero: '' }} onChange={onChange} />)
    await userEvent.type(screen.getByPlaceholderText('Ex: Rua das Flores'), 'R')
    expect(onChange).toHaveBeenCalledWith('rua', 'R')
  })
})
