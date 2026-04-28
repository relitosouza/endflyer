'use client'

interface Props {
  ready: boolean
  loading?: boolean
  onDownload: () => void
  onShare?: () => void
  onPrint4?: () => void
}

export function DownloadButton({ ready, loading = false, onDownload, onShare, onPrint4 }: Props) {
  const isDisabled = !ready || loading
  return (
    <div className="pt-4 flex flex-col sm:flex-row flex-wrap gap-3">
      <button
        type="button"
        disabled={isDisabled}
        onClick={onDownload}
        className={`flex-1 bg-primary-container text-on-primary font-semibold text-[16px] py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 group transition-all
          ${isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:shadow-xl hover:bg-primary cursor-pointer'
          }`}
      >
        {loading ? (
          <>
            Gerando flyer...
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          </>
        ) : (
          <>
            Gerar Flyer para Download
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">download</span>
          </>
        )}
      </button>

      {onShare && (
        <button
          type="button"
          disabled={isDisabled}
          onClick={onShare}
          className={`sm:w-auto bg-white border-2 border-primary-container text-primary font-semibold text-[16px] py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all
            ${isDisabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-primary-fixed/20 cursor-pointer'
            }`}
        >
          <span className="material-symbols-outlined">share</span>
          Compartilhar
        </button>
      )}

      {onPrint4 && (
        <button
          type="button"
          disabled={isDisabled}
          onClick={onPrint4}
          className={`sm:w-auto bg-white border-2 border-primary-container text-primary font-semibold text-[16px] py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all
            ${isDisabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-primary-fixed/20 cursor-pointer'
            }`}
        >
          <span className="material-symbols-outlined">print</span>
          Imprimir (4x A4)
        </button>
      )}
    </div>
  )
}
