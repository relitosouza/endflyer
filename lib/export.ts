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
        title: 'EndFlyer',
        text: 'Confira meu Folheto criado no EndFlyer',
      })
    } catch (error) {
      console.error('Share failed', error)
    }
  } else {
    alert('Seu navegador não suporta compartilhamento direto de arquivos. Baixando a imagem como fallback!')
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

export async function print4PerPage(element: HTMLElement) {
  const { toPng } = await import('html-to-image')
  const dataUrl = await toPng(element, { pixelRatio: 2 })
  
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Por favor, permita pop-ups para imprimir.')
    return
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Imprimir Convites - EndFlyer</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 210mm;
            height: 297mm;
            box-sizing: border-box;
          }
          body {
            padding: 10mm;
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 5mm;
            background: white;
          }
          .item {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            border: 1px dashed #ddd;
            overflow: hidden;
          }
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <div class="item"><img src="${dataUrl}" /></div>
        <div class="item"><img src="${dataUrl}" /></div>
        <div class="item"><img src="${dataUrl}" /></div>
        <div class="item"><img src="${dataUrl}" /></div>
        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
    </html>
  `)
  printWindow.document.close()
}
