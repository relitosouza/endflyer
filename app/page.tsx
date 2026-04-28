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
    <div className="text-on-surface min-h-screen pb-32 md:pb-12 bg-slate-50/50">
      {/* TopAppBar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 py-3 sm:py-4 max-w-[1200px] mx-auto">
          <div className="flex items-center gap-8">
            <div className="text-xl font-extrabold text-violet-700 tracking-tight">FlyerLocal</div>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#" className="hover:text-violet-700 transition-colors">Início</a>
              <a href="#" className="text-violet-700 bg-violet-50 px-3 py-1.5 rounded-lg transition-colors">Criar</a>
              <a href="#" className="hover:text-violet-700 transition-colors">Meus Flyers</a>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors" type="button" aria-label="Notificações">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="hidden md:flex items-center gap-2 hover:bg-slate-50 px-2 py-1.5 rounded-full transition-colors" type="button">
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[18px]">person</span>
              </div>
              <span className="text-sm font-medium text-slate-700 pr-2">Perfil</span>
            </button>
            <div className="md:hidden w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <main className={`mx-auto px-4 sm:px-6 pt-8 md:pt-12 transition-all duration-500 ease-in-out ${imageSrc ? 'max-w-[1200px]' : 'max-w-2xl'}`}>
        {/* Header */}
        <div className="mb-8 md:mb-10 text-center">
          <h1 className="text-h1 text-on-surface mb-2">Criar seu Flyer</h1>
          <p className="text-body-md text-on-surface-variant max-w-lg mx-auto">
            Transforme seu evento local em um flyer profissional em segundos.
          </p>
        </div>

        {/* Form Card / Grid Wrapper */}
        <div className="bg-surface-container-lowest rounded-[1.5rem] p-5 sm:p-8 shadow-[0px_4px_20px_rgba(93,46,192,0.06)] border border-[#EFEFEF]">
          <form className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-10 items-start" onSubmit={(e) => e.preventDefault()}>

            {/* Upload */}
            <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1 order-1">
              <UploadZone onFile={handleFile} />
            </div>

            {/* Preview + StyleControls — shown only after upload */}
            {imageSrc ? (
              <>
                {/* Preview on the right for Desktop */}
                <div className="lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:row-span-4 order-2 w-full max-w-md mx-auto lg:max-w-none">
                  <div className="lg:sticky lg:top-24 space-y-6">
                    <div ref={flyerWrapperRef} className="w-full shadow-sm rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                      <FlyerPreview
                        imageSrc={imageSrc}
                        position={position}
                        onPlace={setPosition}
                        onDrag={setPosition}
                        overlayProps={{ ...address, color, fontSize }}
                      />
                    </div>

                    {/* Tip card Desktop */}
                    <div className="hidden lg:flex bg-tertiary-fixed/30 rounded-xl p-4 gap-4 items-start border border-tertiary-fixed/50">
                      <span className="material-symbols-outlined text-tertiary-container mt-1">info</span>
                      <div className="space-y-1">
                        <p className="text-label-md text-on-tertiary-fixed text-[14px]">Como funciona</p>
                        <p className="text-caption text-on-tertiary-fixed opacity-80">
                          Faça o upload do flyer, preencha os campos e clique na imagem para posicionar o endereço.
                          Arraste para ajustar. Depois clique em <strong>Gerar Flyer para Download</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* StyleControls */}
                <div className="lg:col-span-5 lg:col-start-1 lg:row-start-2 order-3 w-full">
                  <StyleControls
                    color={color}
                    fontSize={fontSize}
                    onColorChange={setColor}
                    onFontSizeChange={setFontSize}
                    onReset={reset}
                  />
                </div>

                {/* Address fields */}
                <div className="lg:col-span-5 lg:col-start-1 lg:row-start-3 order-4 w-full">
                  <AddressForm values={address} onChange={handleAddressChange} />
                </div>

                {/* Download */}
                <div className="lg:col-span-5 lg:col-start-1 lg:row-start-4 order-5 w-full">
                  <DownloadButton ready={isReady} loading={isDownloading} onDownload={handleDownload} />
                </div>
              </>
            ) : null}

          </form>
        </div>

        {/* Tip card Mobile */}
        <div className="lg:hidden mt-8 bg-tertiary-fixed/30 rounded-xl p-4 flex gap-4 items-start mb-8 border border-tertiary-fixed/50 shadow-sm">
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

      {/* BottomNavBar (Mobile only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-3 pb-6 bg-white/90 backdrop-blur-lg border-t border-slate-100 shadow-[0px_-4px_20px_rgba(93,46,192,0.06)] z-50 rounded-t-[24px]">
        <a className="flex flex-col items-center text-slate-400 text-[11px] font-medium hover:text-violet-600 transition-colors" href="#">
          <span className="material-symbols-outlined">home</span><span>Início</span>
        </a>
        <a className="flex flex-col items-center text-violet-700 bg-violet-50 rounded-xl px-3 py-1 text-[11px] font-medium transition-colors" href="#">
          <span className="material-symbols-outlined">add_box</span><span>Criar</span>
        </a>
        <a className="flex flex-col items-center text-slate-400 text-[11px] font-medium hover:text-violet-600 transition-colors" href="#">
          <span className="material-symbols-outlined">library_books</span><span>Meus Flyers</span>
        </a>
        <a className="flex flex-col items-center text-slate-400 text-[11px] font-medium hover:text-violet-600 transition-colors" href="#">
          <span className="material-symbols-outlined">person</span><span>Perfil</span>
        </a>
      </nav>
    </div>
  )
}
