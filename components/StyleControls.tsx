'use client'

interface Props {
  color: string
  fontSize: number
  onColorChange: (color: string) => void
  onFontSizeChange: (size: number) => void
  onReset: () => void
}

export function StyleControls({ color, fontSize, onColorChange, onFontSizeChange, onReset }: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-center pt-1">
      <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2">
        <span className="material-symbols-outlined text-[18px] text-outline">palette</span>
        <span className="text-sm text-on-surface-variant font-medium">Cor</span>
        <input
          data-testid="color-picker"
          type="text"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-20 h-8 rounded-lg border-none cursor-pointer text-xs font-mono px-1"
        />
      </div>

      <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2">
        <span className="material-symbols-outlined text-[18px] text-outline">format_size</span>
        <input
          data-testid="font-size-input"
          type="number"
          value={fontSize}
          min={10}
          max={72}
          onChange={(e) => onFontSizeChange(Number(e.target.value))}
          className="w-12 text-center bg-transparent border-none text-sm font-semibold focus:outline-none"
        />
        <span className="text-xs text-outline">px</span>
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
