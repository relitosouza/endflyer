import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UploadZone } from '@/components/UploadZone'

describe('UploadZone', () => {
  it('renderiza a zona de upload', () => {
    render(<UploadZone onFile={jest.fn()} />)
    expect(screen.getByText('Arraste sua arte aqui')).toBeInTheDocument()
    expect(screen.getByText(/JPG, PNG ou PDF/)).toBeInTheDocument()
  })

  it('chama onFile ao selecionar um arquivo válido', async () => {
    const onFile = jest.fn()
    render(<UploadZone onFile={onFile} />)
    const input = screen.getByTestId('file-input')
    const file = new File(['img'], 'flyer.jpg', { type: 'image/jpeg' })
    await userEvent.upload(input, file)
    expect(onFile).toHaveBeenCalledWith(file)
  })

  it('exibe nome do arquivo após seleção', async () => {
    const onFile = jest.fn()
    render(<UploadZone onFile={onFile} />)
    const input = screen.getByTestId('file-input')
    const file = new File(['img'], 'meu-flyer.png', { type: 'image/png' })
    await userEvent.upload(input, file)
    expect(screen.getByText('meu-flyer.png')).toBeInTheDocument()
  })

  it('chama onFile com null ao remover o arquivo', async () => {
    const onFile = jest.fn()
    render(<UploadZone onFile={onFile} />)
    const input = screen.getByTestId('file-input')
    const file = new File(['img'], 'flyer.jpg', { type: 'image/jpeg' })
    await userEvent.upload(input, file)
    const removeBtn = screen.getByTestId('remove-file')
    await userEvent.click(removeBtn)
    expect(onFile).toHaveBeenLastCalledWith(null)
  })
})
