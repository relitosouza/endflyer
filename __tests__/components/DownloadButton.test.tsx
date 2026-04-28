import { render, screen } from '@testing-library/react'
import { DownloadButton } from '@/components/DownloadButton'

describe('DownloadButton', () => {
  it('fica desabilitado quando ready=false', () => {
    render(<DownloadButton ready={false} onDownload={jest.fn()} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('fica habilitado quando ready=true', () => {
    render(<DownloadButton ready={true} onDownload={jest.fn()} />)
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('chama onDownload ao clicar quando ready=true', async () => {
    const onDownload = jest.fn()
    const { getByRole } = render(<DownloadButton ready={true} onDownload={onDownload} />)
    getByRole('button').click()
    expect(onDownload).toHaveBeenCalled()
  })
})
