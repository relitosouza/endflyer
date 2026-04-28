import * as pdfjsLib from 'pdfjs-dist'

export async function renderPdfFirstPage(file: File): Promise<string> {
  // Set workerSrc inside the function so this module is safe to import in any context
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString()

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 2 })

  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2D canvas context')
  // @ts-expect-error: pdfjs-dist v5 type for render expects RenderParameters, runtime is compatible
  await page.render({ canvasContext: ctx, viewport }).promise

  const dataUrl = canvas.toDataURL('image/png')
  pdf.destroy()
  return dataUrl
}
