'use client'

interface Props {
  color: string
  fontSize: number
  fontFamily: string
  textAlign: 'left' | 'center' | 'right'
  onColorChange: (color: string) => void
  onFontSizeChange: (size: number) => void
  onFontFamilyChange: (font: string) => void
  onTextAlignChange: (align: 'left' | 'center' | 'right') => void
  onAddText?: () => void
  onReset: () => void
}

export function StyleControls({
  color,
  fontSize,
  fontFamily,
  textAlign,
  onColorChange,
  onFontSizeChange,
  onFontFamilyChange,
  onTextAlignChange,
  onAddText,
  onReset,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-center pt-1">


      <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2">
        <span className="material-symbols-outlined text-[18px] text-outline">palette</span>
        <span className="text-sm text-on-surface-variant font-medium">Cor</span>
        <input
          data-testid="color-picker"
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-20 h-8 rounded-lg border-none cursor-pointer text-xs font-mono px-1"
        />
      </div>

      <div className="hidden md:flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2">
        <span className="material-symbols-outlined text-[18px] text-outline">format_size</span>
        <span className="text-sm text-on-surface-variant font-medium">Tamanho</span>
        <button
          type="button"
          onClick={() => onFontSizeChange(Math.max(8, fontSize - 2))}
          className="w-8 h-8 flex items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 active:bg-slate-200 transition-colors"
        >
          -
        </button>
        <span className="text-sm font-semibold min-w-[20px] text-center">{fontSize}</span>
        <button
          type="button"
          onClick={() => onFontSizeChange(Math.min(100, fontSize + 2))}
          className="w-8 h-8 flex items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 active:bg-slate-200 transition-colors"
        >
          +
        </button>
      </div>

      <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2">
        <span className="material-symbols-outlined text-[18px] text-outline">font_download</span>
        <select
          value={fontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          className="bg-transparent border-none text-sm font-semibold focus:outline-none cursor-pointer"
        >
          <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
          <option value="Arial">Arial</option>
          <option value="Impact">Impact</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Roboto">Roboto</option>
        </select>
      </div>

      <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2">
        <span className="material-symbols-outlined text-[18px] text-outline">
          {textAlign === 'left' ? 'format_align_left' : textAlign === 'right' ? 'format_align_right' : 'format_align_center'}
        </span>
        <select
          value={textAlign}
          onChange={(e) => onTextAlignChange(e.target.value as 'left' | 'center' | 'right')}
          className="bg-transparent border-none text-sm font-semibold focus:outline-none cursor-pointer"
        >
          <option value="left">Esquerda</option>
          <option value="center">Centro</option>
          <option value="right">Direita</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="flex items-center gap-1 bg-surface-container rounded-xl px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">replay</span>
        Reposicionar
      </button>
    </div>
  )
}
