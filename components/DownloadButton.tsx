'use client'

interface Props {
  ready: boolean
  onDownload: () => void
}

export function DownloadButton({ ready, onDownload }: Props) {
  return (
    <div className="pt-4">
      <button
        type="button"
        disabled={!ready}
        onClick={onDownload}
        className={`w-full bg-primary-container text-on-primary font-semibold text-[16px] py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 group transition-all
          ${ready
            ? 'hover:shadow-xl hover:bg-primary cursor-pointer'
            : 'opacity-50 cursor-not-allowed'
          }`}
      >
        Gerar Flyer para Download
        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">download</span>
      </button>
    </div>
  )
}
