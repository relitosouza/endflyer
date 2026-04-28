export async function exportAsImage(element: HTMLElement, filename = 'flyer.png') {
  const { toBlob } = await import('html-to-image')
  const blob = await toBlob(element, { pixelRatio: 2 })
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

export async function shareAsImage(element: HTMLElement, filename = 'flyer.png') {
  const { toBlob } = await import('html-to-image')
  const blob = await toBlob(element, { pixelRatio: 2 })
  if (!blob) throw new Error('Failed to export canvas as image')

  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Meu Flyer',
        text: 'Confira meu flyer criado no FlyerLocal!',
      })
    } catch (error) {
      console.error('Share failed', error)
    }
  } else {
    alert('Seu navegador não suporta compartilhamento direto de arquivos. Baixando a imagem como fallback!')
    // Fallback to download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}
