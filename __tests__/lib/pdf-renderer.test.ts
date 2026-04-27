import { renderPdfFirstPage } from '@/lib/pdf-renderer'

// Mock pdfjs-dist completely
jest.mock('pdfjs-dist', () => ({
  getDocument: jest.fn(() => ({
    promise: Promise.resolve({
      getPage: jest.fn(() => Promise.resolve({
        getViewport: jest.fn(() => ({ width: 100, height: 200 })),
        render: jest.fn(() => ({ promise: Promise.resolve() })),
      })),
    }),
  })),
  GlobalWorkerOptions: { workerSrc: '' },
  version: '4.0.0',
}))

describe('renderPdfFirstPage', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('retorna uma string dataURL', async () => {
    const mockFile = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' })
    Object.defineProperty(mockFile, 'arrayBuffer', {
      value: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    })

    // Mock canvas
    const mockCanvas = {
      getContext: jest.fn(() => ({})),
      toDataURL: jest.fn(() => 'data:image/png;base64,abc'),
      width: 0,
      height: 0,
    }
    jest.spyOn(document, 'createElement').mockReturnValue(mockCanvas as unknown as HTMLElement)

    const result = await renderPdfFirstPage(mockFile)
    expect(result).toMatch(/^data:image/)
  })
})
