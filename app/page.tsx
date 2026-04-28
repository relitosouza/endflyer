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
  const [fontFamily, setFontFamily] = useState('Plus Jakarta Sans')
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center')
  const [extraTexts, setExtraTexts] = useState<Array<{
    id: string
    text: string
    position: { x: number; y: number }
    fontSize: number
    color: string
    fontFamily: string
    textAlign: 'left' | 'center' | 'right'
  }>>([])
  const [selectedId, setSelectedId] = useState<string>('address')
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

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem('flyer_draft')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.address) setAddress(prev => ({ ...prev, ...data.address }))
        if (data.color) setColor(data.color)
        if (data.fontSize) setFontSize(data.fontSize)
        if (data.fontFamily) setFontFamily(data.fontFamily)
        if (data.textAlign) setTextAlign(data.textAlign)
        if (data.position) setPosition(data.position)
        if (data.extraTexts) setExtraTexts(data.extraTexts)
        if (data.imageSrc) setImageSrc(data.imageSrc)
      } catch (e) {
        console.error('Erro ao carregar rascunho', e)
      }
    }
  }, [])

  // Save draft on update
  useEffect(() => {
    const data = {
      address,
      color,
      fontSize,
      fontFamily,
      textAlign,
      position,
      extraTexts,
      imageSrc
    }
    try {
      localStorage.setItem('flyer_draft', JSON.stringify(data))
    } catch (e) {
      console.warn('Could not save draft to localStorage. LocalStorage limit might be exceeded.', e)
    }
  }, [address, color, fontSize, fontFamily, textAlign, position, extraTexts, imageSrc])

  async function handleFile(file: File | null) {
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

  function handleAddText() {
    const newText = {
      id: Date.now().toString(),
      text: 'Texto Extra',
      position: { x: 50, y: 50 },
      fontSize: 20,
      color: '#ffffff',
      fontFamily: 'Plus Jakarta Sans',
      textAlign: 'center' as const,
    }
    setExtraTexts((prev) => [...prev, newText])
    setSelectedId(newText.id)
  }

  const activeExtraText = extraTexts.find(t => t.id === selectedId)
  const currentStyles = selectedId === 'address'
    ? { color, fontSize, fontFamily, textAlign }
    : activeExtraText
      ? { color: activeExtraText.color, fontSize: activeExtraText.fontSize, fontFamily: activeExtraText.fontFamily, textAlign: activeExtraText.textAlign }
      : { color, fontSize, fontFamily, textAlign }

  function handleColorChange(c: string) {
    if (selectedId === 'address') setColor(c)
    else setExtraTexts(prev => prev.map(t => t.id === selectedId ? { ...t, color: c } : t))
  }

  function handleFontSizeChange(s: number) {
    if (selectedId === 'address') setFontSize(s)
    else setExtraTexts(prev => prev.map(t => t.id === selectedId ? { ...t, fontSize: s } : t))
  }

  function handleFontFamilyChange(f: string) {
    if (selectedId === 'address') setFontFamily(f)
    else setExtraTexts(prev => prev.map(t => t.id === selectedId ? { ...t, fontFamily: f } : t))
  }

  function handleTextAlignChange(a: 'left' | 'center' | 'right') {
    if (selectedId === 'address') setTextAlign(a)
    else setExtraTexts(prev => prev.map(t => t.id === selectedId ? { ...t, textAlign: a } : t))
  }

  const isReady =
    !!imageSrc &&
    (address.nome || '').trim() !== '' &&
    (address.rua || '').trim() !== '' &&
    (address.numero || '').trim() !== '' &&
    position !== null

  async function handleDownload() {
    if (!flyerWrapperRef.current || isDownloading) return
    setIsDownloading(true)
    
    const canvasEl = flyerWrapperRef.current.querySelector<HTMLElement>('[data-testid="flyer-canvas"]')
    if (!canvasEl) {
      setIsDownloading(false)
      return
    }

    const overlayEls = canvasEl.querySelectorAll<HTMLElement>('[data-testid="text-overlay"]')
    overlayEls.forEach(el => {
      el.style.border = 'none'
      el.style.background = 'transparent'
    })
    try {
      await exportAsImage(canvasEl)
    } finally {
      overlayEls.forEach(el => {
        el.style.border = ''
        el.style.background = ''
      })
      setIsDownloading(false)
    }
  }

  async function handleShare() {
    const { shareAsImage } = await import('@/lib/export')
    if (!flyerWrapperRef.current || isDownloading) return
    setIsDownloading(true)

    const canvasEl = flyerWrapperRef.current.querySelector<HTMLElement>('[data-testid="flyer-canvas"]')
    if (!canvasEl) {
      setIsDownloading(false)
      return
    }

    const overlayEls = canvasEl.querySelectorAll<HTMLElement>('[data-testid="text-overlay"]')
    overlayEls.forEach(el => {
      el.style.border = 'none'
      el.style.background = 'transparent'
    })
    try {
      await shareAsImage(canvasEl)
    } finally {
      overlayEls.forEach(el => {
        el.style.border = ''
        el.style.background = ''
      })
      setIsDownloading(false)
    }
  }

  return (
    <div className="text-on-surface min-h-screen pb-32 md:pb-12 bg-slate-50/50">
      {/* TopAppBar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 py-3 sm:py-4 max-w-[1200px] mx-auto">
          <div className="flex items-center gap-8">
            <div className="text-xl font-extrabold text-violet-700 tracking-tight">EndFlyer</div>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#" className="hover:text-violet-700 transition-colors">Início</a>
              <a href="#" className="text-violet-700 bg-violet-50 px-3 py-1.5 rounded-lg transition-colors">Criar</a>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors" type="button" aria-label="Notificações">
              <span className="material-symbols-outlined">notifications</span>
            </button>
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
                        overlayProps={{ ...address, ...currentStyles }}
                        extraTexts={extraTexts}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onUpdateExtraText={(id, updated) => {
                          setExtraTexts(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t))
                        }}
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
                    color={currentStyles.color}
                    fontSize={currentStyles.fontSize}
                    fontFamily={currentStyles.fontFamily}
                    textAlign={currentStyles.textAlign}
                    onColorChange={handleColorChange}
                    onFontSizeChange={handleFontSizeChange}
                    onFontFamilyChange={handleFontFamilyChange}
                    onTextAlignChange={handleTextAlignChange}
                    onAddText={handleAddText}
                    onReset={reset}
                  />
                </div>

                {/* Conditional text editor for extra texts */}
                {selectedId !== 'address' && activeExtraText && (
                  <div className="lg:col-span-5 lg:col-start-1 lg:row-start-4 order-3 w-full bg-violet-50/50 rounded-2xl p-4 border border-violet-100 space-y-2">
                    <label className="text-label-md text-violet-900">Editar Texto Extra</label>
                    <input
                      type="text"
                      value={activeExtraText.text}
                      onChange={(e) => {
                        setExtraTexts(prev => prev.map(t => t.id === selectedId ? { ...t, text: e.target.value } : t))
                      }}
                      className="w-full px-4 py-2 rounded-xl bg-white border border-violet-200 focus:ring-2 focus:ring-violet-400 focus:outline-none text-sm font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setExtraTexts(prev => prev.filter(t => t.id !== selectedId))
                        setSelectedId('address')
                      }}
                      className="text-xs text-red-600 font-medium flex items-center gap-1 hover:underline pt-1"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span> Excluir Texto
                    </button>
                  </div>
                )}

                {/* Address fields */}
                <div className="lg:col-span-5 lg:col-start-1 lg:row-start-3 order-4 w-full">
                  <AddressForm values={address} onChange={handleAddressChange} />
                </div>

                {/* Download */}
                <div className="lg:col-span-5 lg:col-start-1 lg:row-start-5 order-5 w-full">
                  <DownloadButton ready={isReady} loading={isDownloading} onDownload={handleDownload} onShare={handleShare} />
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
