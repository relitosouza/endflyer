'use client'

interface Props {
  ready: boolean
  loading?: boolean
  onDownload: () => void
}

export function DownloadButton({ ready, loading = false, onDownload }: Props) {
  const isDisabled = !ready || loading
  return (
    <div className="pt-4">
      <button
        type="button"
        disabled={isDisabled}
        onClick={onDownload}
        className={`w-full bg-primary-container text-on-primary font-semibold text-[16px] py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 group transition-all
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
    </div>
  )
}
