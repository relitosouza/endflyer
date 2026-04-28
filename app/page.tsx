'use client'
import { useState, useRef, useEffect } from 'react'
import { UploadZone } from '@/components/UploadZone'
import { FlyerPreview } from '@/components/FlyerPreview'
import { AddressForm } from '@/components/AddressForm'
import { StyleControls } from '@/components/StyleControls'
import { DownloadButton } from '@/components/DownloadButton'
import { useDrag } from '@/hooks/useDrag'
import { exportAsImage } from '@/lib/export'

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [address, setAddress] = useState({ nome: '', rua: '', numero: '' })
  const [color, setColor] = useState('#ffffff')
  const [fontSize, setFontSize] = useState(18)
  const [isDownloading, setIsDownloading] = useState(false)
  const { position, setPosition, reset } = useDrag()
  const flyerWrapperRef = useRef<HTMLDivElement>(null)
  const blobUrlRef = useRef<string | null>(null)

  // Revoke blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [])

  async function handleFile(file: File | null) {
    // Revoke previous blob URL to free memory
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    if (!file) {
      setImageSrc(null)
      reset()
      return
    }
    if (file.type === 'application/pdf') {
      const { renderPdfFirstPage } = await import('@/lib/pdf-renderer')
      const dataUrl = await renderPdfFirstPage(file)
      setImageSrc(dataUrl)
    } else {
      const url = URL.createObjectURL(file)
      blobUrlRef.current = url
      setImageSrc(url)
    }
    reset()
  }

  function handleAddressChange(field: keyof typeof address, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  const isReady =
    !!imageSrc &&
    address.nome.trim() !== '' &&
    address.rua.trim() !== '' &&
    address.numero.trim() !== '' &&
    position !== null

  async function handleDownload() {
    if (!flyerWrapperRef.current || isDownloading) return
    setIsDownloading(true)
    const overlayEl = flyerWrapperRef.current.querySelector<HTMLElement>('[data-testid="text-overlay"]')
    if (overlayEl) {
      overlayEl.style.border = 'none'
      overlayEl.style.background = 'transparent'
    }
    try {
      await exportAsImage(flyerWrapperRef.current)
    } finally {
      if (overlayEl) {
        overlayEl.style.border = '2px dashed rgba(109,63,207,0.7)'
        overlayEl.style.background = 'rgba(109,63,207,0.06)'
      }
      setIsDownloading(false)
    }
  }

  return (
    <div className="text-on-surface min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="text-xl font-extrabold text-violet-700 tracking-tight">FlyerLocal</div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full" type="button" aria-label="Notificações">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-h1 text-on-surface mb-2">Criar seu Flyer</h1>
          <p className="text-body-md text-on-surface-variant">
            Transforme seu evento local em um flyer profissional em segundos.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0px_4px_20px_rgba(93,46,192,0.06)] border border-[#EFEFEF]">
          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>

            {/* Upload */}
            <UploadZone onFile={handleFile} />

            {/* Preview + StyleControls — shown only after upload */}
            {imageSrc ? (
              <>
                <div ref={flyerWrapperRef}>
                  <FlyerPreview
                    imageSrc={imageSrc}
                    position={position}
                    onPlace={setPosition}
                    onDrag={setPosition}
                    overlayProps={{ ...address, color, fontSize }}
                  />
                </div>
                <StyleControls
                  color={color}
                  fontSize={fontSize}
                  onColorChange={setColor}
                  onFontSizeChange={setFontSize}
                  onReset={reset}
                />
              </>
            ) : null}

            {/* Address fields */}
            <AddressForm values={address} onChange={handleAddressChange} />

            {/* Download */}
            <DownloadButton ready={isReady} loading={isDownloading} onDownload={handleDownload} />
          </form>
        </div>

        {/* Tip card */}
        <div className="mt-8 bg-tertiary-fixed/30 rounded-xl p-4 flex gap-4 items-start mb-8">
          <span className="material-symbols-outlined text-tertiary-container mt-1">info</span>
          <div className="space-y-1">
            <p className="text-label-md text-on-tertiary-fixed text-[14px]">Como funciona</p>
            <p className="text-caption text-on-tertiary-fixed opacity-80">
              Faça o upload do flyer, preencha os campos e clique na imagem para posicionar o endereço.
              Arraste para ajustar. Depois clique em <strong>Gerar Flyer para Download</strong>.
            </p>
          </div>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-3 pb-6 bg-white/90 backdrop-blur-lg border-t border-slate-100 shadow-[0px_-4px_20px_rgba(93,46,192,0.06)] z-50 rounded-t-[24px]">
        <a className="flex flex-col items-center text-slate-400 text-[11px] font-medium hover:text-violet-600" href="#">
          <span className="material-symbols-outlined">home</span><span>Início</span>
        </a>
        <a className="flex flex-col items-center text-violet-700 bg-violet-50 rounded-xl px-3 py-1 text-[11px] font-medium" href="#">
          <span className="material-symbols-outlined">add_box</span><span>Criar</span>
        </a>
        <a className="flex flex-col items-center text-slate-400 text-[11px] font-medium hover:text-violet-600" href="#">
          <span className="material-symbols-outlined">library_books</span><span>Meus Flyers</span>
        </a>
        <a className="flex flex-col items-center text-slate-400 text-[11px] font-medium hover:text-violet-600" href="#">
          <span className="material-symbols-outlined">person</span><span>Perfil</span>
        </a>
      </nav>
    </div>
  )
}
