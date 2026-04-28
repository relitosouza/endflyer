export async function exportAsImage(element: HTMLElement, filename = 'flyer.png') {
  const html2canvas = (await import('html2canvas')).default
  const canvas = await html2canvas(element, { useCORS: true, scale: 2 })
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png')
  )
  if (!blob) throw new Error('Failed to export canvas as image')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
