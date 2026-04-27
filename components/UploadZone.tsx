'use client'
import { useState, useRef } from 'react'

interface Props {
  onFile: (file: File | null) => void
}

export function UploadZone({ onFile }: Props) {
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (file) {
      setFileName(file.name)
      onFile(file)
    }
  }

  function handleRemove() {
    setFileName(null)
    if (inputRef.current) inputRef.current.value = ''
    onFile(null)
  }

  return (
    <div className="space-y-3">
      <label className="text-label-md text-on-surface-variant">Imagem do Flyer</label>

      {!fileName ? (
        <div className="relative group cursor-pointer border-2 border-dashed border-outline-variant rounded-xl p-10 bg-surface-container-low hover:bg-surface-container-lowest transition-all duration-300 flex flex-col items-center justify-center text-center">
          <input
            ref={inputRef}
            data-testid="file-input"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleChange}
          />
          <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
          </div>
          <h3 className="text-h3 text-on-surface mb-1">Arraste sua arte aqui</h3>
          <p className="text-caption text-outline">JPG, PNG ou PDF (Máx. 5MB)</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-primary-fixed rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-primary">check_circle</span>
          <span className="text-sm font-semibold text-primary flex-1 truncate">{fileName}</span>
          <button
            type="button"
            data-testid="remove-file"
            onClick={handleRemove}
            className="text-primary hover:text-[#4501a9]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </div>
  )
}
