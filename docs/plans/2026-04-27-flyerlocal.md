# FlyerLocal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:executing-plans to implement this plan task-by-task.

**Goal:** Criar uma aplicação Next.js client-side onde o usuário faz upload de um flyer (JPG/PNG/PDF), preenche campos de endereço, posiciona o texto arrastando sobre o flyer e baixa o resultado como PNG via html2canvas.

**Architecture:** Aplicação Next.js 15 (App Router), página única (`/`), 100% client-side. O estado é gerenciado com `useState`/`useRef` na página principal e passado para os componentes filhos via props. PDF é convertido para imagem com `pdfjs-dist` antes de ser exibido. A exportação usa `html2canvas` com dynamic import para evitar erros de SSR.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS (config customizado), html2canvas, pdfjs-dist, Material Symbols Outlined (Google Fonts), Plus Jakarta Sans (Google Fonts), Jest + React Testing Library.

---

## Task 0: Scaffold do projeto Next.js

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- Create: `app/layout.tsx`
- Create: `app/globals.css`

**Step 1: Criar o projeto Next.js**

```bash
cd E:/projetos/End_Flyer
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --no-eslint --import-alias "@/*"
```

Responda: Yes para TypeScript, Yes para Tailwind, Yes para App Router, No para src directory.

**Step 2: Instalar dependências**

```bash
npm install html2canvas pdfjs-dist
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest
```

**Step 3: Configurar Jest**

Criar `jest.config.ts`:
```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

Criar `jest.setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

Adicionar em `package.json` scripts:
```json
"test": "jest",
"test:watch": "jest --watch"
```

**Step 4: Design tokens — Tailwind v4 approach**

> **NOTE (updated 2026-04-27):** This project uses **Tailwind CSS v4**, which does NOT use a `tailwind.config.ts` file for design tokens. Do NOT create or reference a `tailwind.config.ts` file.
>
> In Tailwind v4, all custom design tokens (colors, spacing, font sizes, border radii, font families) are defined via the `@theme` block directly in `app/globals.css`. Font-weight and letter-spacing companions (`--text-*--font-weight`, `--text-*--letter-spacing`) are NOT supported in `@theme` — they are silently ignored. Instead, apply those styles via `@layer base` utility class rules.
>
> Future tasks that need new design tokens should add them to the `@theme` block in `app/globals.css`. If a font-weight or letter-spacing is needed for a custom text size utility, add a corresponding rule in the `@layer base` block in that same file.

**Step 5: Substituir `app/globals.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

body {
  background-color: #fcf9f8;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
```

**Step 6: Atualizar `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlyerLocal',
  description: 'Adicione endereços nos seus flyers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
```

**Step 7: Verificar que o projeto sobe**

```bash
npm run dev
```

Abrir http://localhost:3000 — deve carregar a página padrão do Next.js sem erros.

**Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js project with design system"
```

---

## Task 1: Hook useDrag

**Files:**
- Create: `hooks/useDrag.ts`
- Create: `__tests__/hooks/useDrag.test.ts`

**Step 1: Escrever o teste**

```typescript
// __tests__/hooks/useDrag.test.ts
import { renderHook, act } from '@testing-library/react'
import { useDrag } from '@/hooks/useDrag'

describe('useDrag', () => {
  it('retorna posição inicial como null', () => {
    const { result } = renderHook(() => useDrag())
    expect(result.current.position).toBeNull()
  })

  it('setPosition atualiza a posição', () => {
    const { result } = renderHook(() => useDrag())
    act(() => { result.current.setPosition({ x: 100, y: 200 }) })
    expect(result.current.position).toEqual({ x: 100, y: 200 })
  })

  it('reset volta posição para null', () => {
    const { result } = renderHook(() => useDrag())
    act(() => { result.current.setPosition({ x: 50, y: 50 }) })
    act(() => { result.current.reset() })
    expect(result.current.position).toBeNull()
  })
})
```

**Step 2: Rodar para confirmar falha**

```bash
npm test -- hooks/useDrag
```

Esperado: FAIL "Cannot find module '@/hooks/useDrag'"

**Step 3: Implementar o hook**

```typescript
// hooks/useDrag.ts
'use client'
import { useState, useCallback } from 'react'

export interface Position { x: number; y: number }

export function useDrag() {
  const [position, setPosition] = useState<Position | null>(null)
  const reset = useCallback(() => setPosition(null), [])
  return { position, setPosition, reset }
}
```

**Step 4: Rodar para confirmar passou**

```bash
npm test -- hooks/useDrag
```

Esperado: PASS

**Step 5: Commit**

```bash
git add hooks/useDrag.ts __tests__/hooks/useDrag.test.ts
git commit -m "feat: add useDrag hook"
```

---

## Task 2: Utilitário PDF → imagem

**Files:**
- Create: `lib/pdf-renderer.ts`
- Create: `__tests__/lib/pdf-renderer.test.ts`

**Step 1: Escrever o teste**

```typescript
// __tests__/lib/pdf-renderer.test.ts
import { renderPdfFirstPage } from '@/lib/pdf-renderer'

// Mock pdfjs-dist
jest.mock('pdfjs-dist', () => ({
  getDocument: jest.fn(() => ({
    promise: Promise.resolve({
      getPage: jest.fn(() => Promise.resolve({
        getViewport: jest.fn(() => ({ width: 100, height: 200, scale: 1 })),
        render: jest.fn(() => ({ promise: Promise.resolve() })),
      })),
    }),
  })),
  GlobalWorkerOptions: { workerSrc: '' },
}))

describe('renderPdfFirstPage', () => {
  it('retorna uma string dataURL', async () => {
    // Cria um mock de File para PDF
    const mockFile = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' })

    // Mock do canvas
    const mockCanvas = {
      getContext: jest.fn(() => ({})),
      toDataURL: jest.fn(() => 'data:image/png;base64,abc'),
      width: 0,
      height: 0,
    }
    jest.spyOn(document, 'createElement').mockReturnValue(mockCanvas as any)

    const result = await renderPdfFirstPage(mockFile)
    expect(result).toMatch(/^data:image/)
  })
})
```

**Step 2: Rodar para confirmar falha**

```bash
npm test -- pdf-renderer
```

**Step 3: Implementar**

```typescript
// lib/pdf-renderer.ts
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export async function renderPdfFirstPage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 2 })

  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height

  const ctx = canvas.getContext('2d')!
  await page.render({ canvasContext: ctx, viewport }).promise

  return canvas.toDataURL('image/png')
}
```

**Step 4: Rodar para confirmar passou**

```bash
npm test -- pdf-renderer
```

**Step 5: Commit**

```bash
git add lib/pdf-renderer.ts __tests__/lib/pdf-renderer.test.ts
git commit -m "feat: add PDF first-page renderer utility"
```

---

## Task 3: Componente UploadZone

**Files:**
- Create: `components/UploadZone.tsx`
- Create: `__tests__/components/UploadZone.test.tsx`

**Step 1: Escrever o teste**

```typescript
// __tests__/components/UploadZone.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UploadZone } from '@/components/UploadZone'

describe('UploadZone', () => {
  it('renderiza a zona de upload', () => {
    render(<UploadZone onFile={jest.fn()} />)
    expect(screen.getByText('Arraste sua arte aqui')).toBeInTheDocument()
    expect(screen.getByText(/JPG, PNG ou PDF/)).toBeInTheDocument()
  })

  it('chama onFile ao selecionar um arquivo válido', async () => {
    const onFile = jest.fn()
    render(<UploadZone onFile={onFile} />)
    const input = screen.getByTestId('file-input')
    const file = new File(['img'], 'flyer.jpg', { type: 'image/jpeg' })
    await userEvent.upload(input, file)
    expect(onFile).toHaveBeenCalledWith(file)
  })

  it('exibe nome do arquivo após seleção', async () => {
    const onFile = jest.fn()
    render(<UploadZone onFile={onFile} />)
    const input = screen.getByTestId('file-input')
    const file = new File(['img'], 'meu-flyer.png', { type: 'image/png' })
    await userEvent.upload(input, file)
    expect(screen.getByText('meu-flyer.png')).toBeInTheDocument()
  })

  it('chama onFile com null ao remover o arquivo', async () => {
    const onFile = jest.fn()
    render(<UploadZone onFile={onFile} />)
    const input = screen.getByTestId('file-input')
    const file = new File(['img'], 'flyer.jpg', { type: 'image/jpeg' })
    await userEvent.upload(input, file)
    const removeBtn = screen.getByTestId('remove-file')
    await userEvent.click(removeBtn)
    expect(onFile).toHaveBeenLastCalledWith(null)
  })
})
```

**Step 2: Rodar para confirmar falha**

```bash
npm test -- UploadZone
```

**Step 3: Implementar**

```typescript
// components/UploadZone.tsx
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
```

**Step 4: Rodar para confirmar passou**

```bash
npm test -- UploadZone
```

**Step 5: Commit**

```bash
git add components/UploadZone.tsx __tests__/components/UploadZone.test.tsx
git commit -m "feat: add UploadZone component"
```

---

## Task 4: Componente TextOverlay

**Files:**
- Create: `components/TextOverlay.tsx`
- Create: `__tests__/components/TextOverlay.test.tsx`

**Step 1: Escrever o teste**

```typescript
// __tests__/components/TextOverlay.test.tsx
import { render, screen } from '@testing-library/react'
import { TextOverlay } from '@/components/TextOverlay'

const defaultProps = {
  nome: 'João da Silva',
  rua: 'Rua das Flores',
  numero: '123',
  color: '#ffffff',
  fontSize: 18,
  position: { x: 50, y: 100 },
  onDrag: jest.fn(),
}

describe('TextOverlay', () => {
  it('renderiza nome em negrito', () => {
    render(<TextOverlay {...defaultProps} />)
    const nome = screen.getByText('João da Silva')
    expect(nome).toBeInTheDocument()
    expect(nome).toHaveStyle({ fontWeight: '700' })
  })

  it('renderiza rua e número na segunda linha', () => {
    render(<TextOverlay {...defaultProps} />)
    expect(screen.getByText('Rua das Flores, 123')).toBeInTheDocument()
  })

  it('aplica a cor do texto', () => {
    render(<TextOverlay {...defaultProps} color="#ff0000" />)
    const nome = screen.getByText('João da Silva')
    expect(nome).toHaveStyle({ color: '#ff0000' })
  })

  it('aplica o tamanho de fonte no nome', () => {
    render(<TextOverlay {...defaultProps} fontSize={24} />)
    const nome = screen.getByText('João da Silva')
    expect(nome).toHaveStyle({ fontSize: '24px' })
  })

  it('posiciona no local correto', () => {
    render(<TextOverlay {...defaultProps} position={{ x: 50, y: 100 }} />)
    const el = screen.getByTestId('text-overlay')
    expect(el).toHaveStyle({ left: '50px', top: '100px' })
  })
})
```

**Step 2: Rodar para confirmar falha**

```bash
npm test -- TextOverlay
```

**Step 3: Implementar**

```typescript
// components/TextOverlay.tsx
'use client'
import { useRef } from 'react'
import type { Position } from '@/hooks/useDrag'

interface Props {
  nome: string
  rua: string
  numero: string
  color: string
  fontSize: number
  position: Position
  onDrag: (pos: Position) => void
  containerRef: React.RefObject<HTMLDivElement>
}

export function TextOverlay({ nome, rua, numero, color, fontSize, position, onDrag, containerRef }: Props) {
  const isDragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  function handleMouseDown(e: React.MouseEvent) {
    if (!containerRef.current) return
    isDragging.current = true
    const rect = containerRef.current.getBoundingClientRect()
    // Offset = distância entre o ponto de clique e a origem do overlay (relativo ao container)
    dragOffset.current = {
      x: e.clientX - rect.left - position.x,
      y: e.clientY - rect.top - position.y,
    }
    e.stopPropagation()
    e.preventDefault()

    function onMove(ev: MouseEvent) {
      if (!containerRef.current) return
      const r = containerRef.current.getBoundingClientRect()
      onDrag({
        x: ev.clientX - r.left - dragOffset.current.x,
        y: ev.clientY - r.top - dragOffset.current.y,
      })
    }

    function onUp() {
      isDragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div
      data-testid="text-overlay"
      onMouseDown={handleMouseDown}
      style={{ left: position.x, top: position.y }}
      className="absolute cursor-grab active:cursor-grabbing select-none px-2 py-1 border-2 border-dashed border-[rgba(109,63,207,0.7)] rounded-md bg-[rgba(109,63,207,0.06)]"
    >
      <div style={{ fontWeight: 700, fontSize: `${fontSize}px`, color, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
        {nome}
      </div>
      <div style={{ fontWeight: 400, fontSize: '14px', color, lineHeight: 1.4, whiteSpace: 'nowrap' }}>
        {rua}, {numero}
      </div>
    </div>
  )
}
```

**Step 4: Rodar para confirmar passou**

```bash
npm test -- TextOverlay
```

**Step 5: Commit**

```bash
git add components/TextOverlay.tsx __tests__/components/TextOverlay.test.tsx
git commit -m "feat: add TextOverlay draggable component"
```

---

## Task 5: Componente FlyerPreview

**Files:**
- Create: `components/FlyerPreview.tsx`
- Create: `__tests__/components/FlyerPreview.test.tsx`

**Step 1: Escrever o teste**

```typescript
// __tests__/components/FlyerPreview.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { FlyerPreview } from '@/components/FlyerPreview'

const baseProps = {
  imageSrc: 'data:image/png;base64,abc',
  position: null,
  onPlace: jest.fn(),
  onDrag: jest.fn(),
  containerRef: { current: null },
  overlayProps: { nome: '', rua: '', numero: '', color: '#fff', fontSize: 18 },
}

describe('FlyerPreview', () => {
  it('exibe a imagem do flyer', () => {
    render(<FlyerPreview {...baseProps} />)
    expect(screen.getByTestId('flyer-image')).toBeInTheDocument()
  })

  it('mostra hint quando não há posição', () => {
    render(<FlyerPreview {...baseProps} position={null} />)
    expect(screen.getByTestId('click-hint')).toBeInTheDocument()
  })

  it('oculta hint quando há posição', () => {
    render(<FlyerPreview {...baseProps} position={{ x: 10, y: 20 }} />)
    expect(screen.queryByTestId('click-hint')).not.toBeInTheDocument()
  })

  it('chama onPlace com coordenadas ao clicar', () => {
    const onPlace = jest.fn()
    const { container } = render(<FlyerPreview {...baseProps} onPlace={onPlace} />)
    const wrapper = screen.getByTestId('flyer-wrapper')
    // Simula clique com getBoundingClientRect mockado
    jest.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect)
    fireEvent.click(wrapper, { clientX: 100, clientY: 150 })
    expect(onPlace).toHaveBeenCalledWith({ x: expect.any(Number), y: expect.any(Number) })
  })
})
```

**Step 2: Rodar para confirmar falha**

```bash
npm test -- FlyerPreview
```

**Step 3: Implementar**

```typescript
// components/FlyerPreview.tsx
'use client'
import { useRef } from 'react'
import { TextOverlay } from './TextOverlay'
import type { Position } from '@/hooks/useDrag'

interface OverlayProps {
  nome: string
  rua: string
  numero: string
  color: string
  fontSize: number
}

interface Props {
  imageSrc: string
  position: Position | null
  onPlace: (pos: Position) => void
  onDrag: (pos: Position) => void
  overlayProps: OverlayProps
}

export function FlyerPreview({ imageSrc, position, onPlace, onDrag, overlayProps }: Props) {
  const containerRef = useRef<HTMLDivElement>(null!)

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    onPlace({ x: e.clientX - rect.left - 60, y: e.clientY - rect.top - 20 })
  }

  return (
    <div className="space-y-3">
      <label className="text-label-md text-on-surface-variant flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-primary">touch_app</span>
        {position ? 'Arraste para ajustar a posição' : 'Clique no flyer para posicionar o endereço'}
      </label>

      <div
        ref={containerRef}
        data-testid="flyer-wrapper"
        onClick={handleClick}
        className="relative rounded-2xl overflow-hidden shadow-[0px_4px_24px_rgba(93,46,192,0.12)] border border-[#EFEFEF]"
        style={{ cursor: position ? 'default' : 'crosshair' }}
      >
        <img
          data-testid="flyer-image"
          src={imageSrc}
          alt="Flyer"
          className="w-full block rounded-2xl"
        />

        {!position && (
          <div
            data-testid="click-hint"
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            <span className="material-symbols-outlined text-5xl text-white/70 mb-2">touch_app</span>
            <span className="text-white/80 text-sm font-semibold bg-black/30 px-3 py-1 rounded-full">
              Clique para posicionar
            </span>
          </div>
        )}

        {position && (
          <TextOverlay
            {...overlayProps}
            position={position}
            onDrag={onDrag}
            containerRef={containerRef}
          />
        )}
      </div>
    </div>
  )
}
```

**Step 4: Rodar para confirmar passou**

```bash
npm test -- FlyerPreview
```

**Step 5: Commit**

```bash
git add components/FlyerPreview.tsx __tests__/components/FlyerPreview.test.tsx
git commit -m "feat: add FlyerPreview component with click-to-place"
```

---

## Task 6: Componente AddressForm

**Files:**
- Create: `components/AddressForm.tsx`
- Create: `__tests__/components/AddressForm.test.tsx`

**Step 1: Escrever o teste**

```typescript
// __tests__/components/AddressForm.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddressForm } from '@/components/AddressForm'

describe('AddressForm', () => {
  it('renderiza os três campos', () => {
    render(<AddressForm values={{ nome: '', rua: '', numero: '' }} onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText('Ex: João da Silva')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ex: Rua das Flores')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('123')).toBeInTheDocument()
  })

  it('chama onChange com campo correto ao digitar no nome', async () => {
    const onChange = jest.fn()
    render(<AddressForm values={{ nome: '', rua: '', numero: '' }} onChange={onChange} />)
    const input = screen.getByPlaceholderText('Ex: João da Silva')
    await userEvent.type(input, 'M')
    expect(onChange).toHaveBeenCalledWith('nome', 'M')
  })

  it('chama onChange com campo correto ao digitar na rua', async () => {
    const onChange = jest.fn()
    render(<AddressForm values={{ nome: '', rua: '', numero: '' }} onChange={onChange} />)
    await userEvent.type(screen.getByPlaceholderText('Ex: Rua das Flores'), 'R')
    expect(onChange).toHaveBeenCalledWith('rua', 'R')
  })
})
```

**Step 2: Rodar para confirmar falha**

```bash
npm test -- AddressForm
```

**Step 3: Implementar**

```typescript
// components/AddressForm.tsx
'use client'

interface Values {
  nome: string
  rua: string
  numero: string
}

interface Props {
  values: Values
  onChange: (field: keyof Values, value: string) => void
}

function Field({
  id, label, icon, placeholder, value, bold, onChange,
}: {
  id: keyof Values; label: string; icon: string; placeholder: string
  value: string; bold?: boolean; onChange: (f: keyof Values, v: string) => void
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-label-md text-on-surface-variant">{label}</label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">{icon}</span>
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className={`w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-primary-container text-body-md transition-all ${bold ? 'font-bold' : ''}`}
        />
      </div>
    </div>
  )
}

export function AddressForm({ values, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
      <div className="md:col-span-2">
        <Field id="nome" label="Nome" icon="person" placeholder="Ex: João da Silva" value={values.nome} bold onChange={onChange} />
      </div>
      <Field id="rua" label="Rua / Logradouro" icon="map" placeholder="Ex: Rua das Flores" value={values.rua} onChange={onChange} />
      <Field id="numero" label="Número" icon="tag" placeholder="123" value={values.numero} onChange={onChange} />
    </div>
  )
}
```

**Step 4: Rodar para confirmar passou**

```bash
npm test -- AddressForm
```

**Step 5: Commit**

```bash
git add components/AddressForm.tsx __tests__/components/AddressForm.test.tsx
git commit -m "feat: add AddressForm component"
```

---

## Task 7: Componente StyleControls

**Files:**
- Create: `components/StyleControls.tsx`
- Create: `__tests__/components/StyleControls.test.tsx`

**Step 1: Escrever o teste**

```typescript
// __tests__/components/StyleControls.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StyleControls } from '@/components/StyleControls'

describe('StyleControls', () => {
  it('renderiza color picker com valor inicial', () => {
    render(<StyleControls color="#ffffff" fontSize={18} onColorChange={jest.fn()} onFontSizeChange={jest.fn()} onReset={jest.fn()} />)
    expect(screen.getByTestId('color-picker')).toHaveValue('#ffffff')
  })

  it('chama onColorChange ao mudar cor', async () => {
    const onColorChange = jest.fn()
    render(<StyleControls color="#ffffff" fontSize={18} onColorChange={onColorChange} onFontSizeChange={jest.fn()} onReset={jest.fn()} />)
    const picker = screen.getByTestId('color-picker')
    await userEvent.type(picker, '#ff0000')
    expect(onColorChange).toHaveBeenCalled()
  })

  it('chama onReset ao clicar em Reposicionar', async () => {
    const onReset = jest.fn()
    render(<StyleControls color="#ffffff" fontSize={18} onColorChange={jest.fn()} onFontSizeChange={jest.fn()} onReset={onReset} />)
    await userEvent.click(screen.getByText('Reposicionar'))
    expect(onReset).toHaveBeenCalled()
  })
})
```

**Step 2: Rodar para confirmar falha**

```bash
npm test -- StyleControls
```

**Step 3: Implementar**

```typescript
// components/StyleControls.tsx
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
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-8 h-8 rounded-lg border-none cursor-pointer"
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
```

**Step 4: Rodar para confirmar passou**

```bash
npm test -- StyleControls
```

**Step 5: Commit**

```bash
git add components/StyleControls.tsx __tests__/components/StyleControls.test.tsx
git commit -m "feat: add StyleControls component"
```

---

## Task 8: Componente DownloadButton + exportação html2canvas

**Files:**
- Create: `components/DownloadButton.tsx`
- Create: `lib/export.ts`
- Create: `__tests__/components/DownloadButton.test.tsx`

**Step 1: Escrever os testes**

```typescript
// __tests__/components/DownloadButton.test.tsx
import { render, screen } from '@testing-library/react'
import { DownloadButton } from '@/components/DownloadButton'

describe('DownloadButton', () => {
  it('fica desabilitado quando ready=false', () => {
    render(<DownloadButton ready={false} onDownload={jest.fn()} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('fica habilitado quando ready=true', () => {
    render(<DownloadButton ready={true} onDownload={jest.fn()} />)
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('chama onDownload ao clicar quando ready=true', async () => {
    const onDownload = jest.fn()
    const { getByRole } = render(<DownloadButton ready={true} onDownload={onDownload} />)
    getByRole('button').click()
    expect(onDownload).toHaveBeenCalled()
  })
})
```

**Step 2: Rodar para confirmar falha**

```bash
npm test -- DownloadButton
```

**Step 3: Implementar `lib/export.ts`**

```typescript
// lib/export.ts
export async function exportAsImage(element: HTMLElement, filename = 'flyer.png') {
  // Dynamic import para evitar erro de SSR
  const html2canvas = (await import('html2canvas')).default
  const canvas = await html2canvas(element, { useCORS: true, scale: 2 })
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), 'image/png')
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

**Step 4: Implementar `components/DownloadButton.tsx`**

```typescript
// components/DownloadButton.tsx
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
```

**Step 5: Rodar para confirmar passou**

```bash
npm test -- DownloadButton
```

**Step 6: Commit**

```bash
git add components/DownloadButton.tsx lib/export.ts __tests__/components/DownloadButton.test.tsx
git commit -m "feat: add DownloadButton and html2canvas export utility"
```

---

## Task 9: Página principal — integração de todos os componentes

**Files:**
- Modify: `app/page.tsx`

**Step 1: Implementar `app/page.tsx`**

```typescript
// app/page.tsx
'use client'
import { useState, useRef } from 'react'
import { UploadZone } from '@/components/UploadZone'
import { FlyerPreview } from '@/components/FlyerPreview'
import { AddressForm } from '@/components/AddressForm'
import { StyleControls } from '@/components/StyleControls'
import { DownloadButton } from '@/components/DownloadButton'
import { useDrag } from '@/hooks/useDrag'
import { renderPdfFirstPage } from '@/lib/pdf-renderer'
import { exportAsImage } from '@/lib/export'

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [address, setAddress] = useState({ nome: '', rua: '', numero: '' })
  const [color, setColor] = useState('#ffffff')
  const [fontSize, setFontSize] = useState(18)
  const { position, setPosition, reset } = useDrag()
  const flyerWrapperRef = useRef<HTMLDivElement>(null!)
  const overlayRef = useRef<HTMLDivElement>(null!)

  async function handleFile(file: File | null) {
    if (!file) { setImageSrc(null); reset(); return }
    if (file.type === 'application/pdf') {
      const dataUrl = await renderPdfFirstPage(file)
      setImageSrc(dataUrl)
    } else {
      setImageSrc(URL.createObjectURL(file))
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
    if (!flyerWrapperRef.current) return
    // Remove borda dashed do overlay antes de capturar
    const overlayEl = flyerWrapperRef.current.querySelector<HTMLElement>('[data-testid="text-overlay"]')
    if (overlayEl) {
      overlayEl.style.border = 'none'
      overlayEl.style.background = 'transparent'
    }
    await exportAsImage(flyerWrapperRef.current)
    // Restaura borda
    if (overlayEl) {
      overlayEl.style.border = '2px dashed rgba(109,63,207,0.7)'
      overlayEl.style.background = 'rgba(109,63,207,0.06)'
    }
  }

  return (
    <div className="text-on-background min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="text-xl font-extrabold text-violet-700 tracking-tight">FlyerLocal</div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full">
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

            {/* Preview (visível só após upload) */}
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

            {/* Campos de endereço */}
            <AddressForm values={address} onChange={handleAddressChange} />

            {/* Download */}
            <DownloadButton ready={isReady} onDownload={handleDownload} />
          </form>
        </div>

        {/* Tip */}
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
```

**Step 2: Rodar todos os testes**

```bash
npm test
```

Esperado: todos os testes passando.

**Step 3: Rodar o servidor de desenvolvimento**

```bash
npm run dev
```

Verificar manualmente em http://localhost:3000:
- [ ] Upload de JPG/PNG exibe a imagem
- [ ] Upload de PDF exibe a primeira página
- [ ] Clique no flyer posiciona o bloco de texto
- [ ] Arraste reposiciona o bloco
- [ ] Campos refletem em tempo real no overlay
- [ ] Color picker muda a cor do texto
- [ ] Input de tamanho muda o tamanho do Nome
- [ ] Botão desabilitado até tudo preenchido
- [ ] Botão ativo → clique gera download do PNG

**Step 4: Commit final**

```bash
git add app/page.tsx
git commit -m "feat: wire all components into main page — FlyerLocal complete"
```
