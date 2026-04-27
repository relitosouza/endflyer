# FlyerLocal — Design Spec
**Data:** 2026-04-27

## Visão geral

Aplicação Next.js client-side que permite ao usuário fazer upload de um flyer (JPG, PNG ou PDF), preencher campos de endereço (Nome, Rua, Número), posicionar o texto sobre o flyer clicando e arrastando, e baixar o resultado como PNG usando `html2canvas`.

---

## Stack

- **Framework:** Next.js 15 (App Router)
- **Estilo:** Tailwind CSS + design system do modelo (Plus Jakarta Sans, Material Symbols, paleta violet/purple)
- **Export:** `html2canvas`
- **PDF rendering:** `pdfjs-dist` (renderiza primeira página como imagem canvas)
- **Sem backend** — tudo client-side

---

## Página única `/`

### Layout (seguindo modelo de referência)

- TopAppBar: logo "FlyerLocal" + ícone notificações + avatar
- `max-w-2xl mx-auto` centralizado
- Card branco arredondado (`rounded-[1.5rem]`) com sombra suave
- BottomNavBar fixo: Início | Criar (ativo) | Meus Flyers | Perfil

---

## Componentes

### `UploadZone`
- Área dashed com ícone `upload_file`, texto "Arraste sua arte aqui", legenda "JPG, PNG ou PDF (Máx. 5MB)"
- Input `<file>` invisível sobreposto
- Após seleção: exibe chip com nome do arquivo + botão remover
- Ao selecionar: revela `FlyerPreview` logo abaixo

### `FlyerPreview`
- Exibe imagem do flyer (JPG/PNG direto via `URL.createObjectURL`, PDF via `pdfjs-dist` → canvas → dataURL)
- `cursor: crosshair` enquanto texto não posicionado
- Clique na imagem define posição `(x, y)` do `TextOverlay`
- Chip de instrução: "Clique no flyer para posicionar o endereço" → muda para "Arraste para ajustar" após posicionar
- Wrapper com `position: relative` para conter o overlay absoluto

### `TextOverlay`
- `<div>` com `position: absolute` sobre o flyer
- **Linha 1:** Nome — `font-weight: 700`, tamanho configurável (padrão 18px)
- **Linha 2:** Rua + ", " + Número — `font-weight: 400`, 14px
- Cor do texto: configurável via color picker
- Borda dashed roxa ao redor (indicação visual de que é arrastável)
- Drag com mouse events (`mousedown/mousemove/mouseup`) e touch events

### `AddressForm`
Campos dentro do card, abaixo do preview:
- **Nome** (col-span-2): `font-bold`, ícone `person`, placeholder "Ex: João da Silva"
- **Rua / Logradouro** (col-span-1): ícone `map`
- **Número** (col-span-1): ícone `tag`
- Atualização em tempo real do `TextOverlay` via `oninput`

### `StyleControls`
Inline com o preview (barra de ajustes rápidos):
- Color picker para cor do texto (padrão: branco `#ffffff`)
- Input numérico para tamanho do Nome (10–72px)
- Botão "Reposicionar" — reseta posição e mostra hint novamente

### `DownloadButton`
- Texto: "Gerar Flyer para Download", ícone `download`
- **Desabilitado** (opacity-50, cursor-not-allowed) até que: arquivo carregado + Nome preenchido + Rua preenchida + Número preenchido + posição definida
- Ao clicar: `html2canvas(flyerWrapperRef)` → `canvas.toBlob()` → download automático como `flyer.png`
- Remove borda dashed do `TextOverlay` antes de capturar, restaura depois

---

## Fluxo de dados

```
FileInput
  → JPG/PNG: URL.createObjectURL → <img src>
  → PDF: pdfjs-dist renderiza página 1 → dataURL → <img src>
  → revela FlyerPreview

AddressForm (oninput)
  → atualiza TextOverlay em tempo real

StyleControls (oninput)
  → cor: atualiza color de ambas as linhas do TextOverlay
  → tamanho: atualiza font-size da linha Nome

Click no FlyerPreview
  → seta left/top do TextOverlay
  → oculta hint, muda cursor

Drag do TextOverlay
  → atualiza left/top via mousemove/touchmove

DownloadButton (onclick)
  → remove borda dashed temporariamente
  → html2canvas(wrapper) → blob → <a download> → click
  → restaura borda dashed
```

---

## Estados da página

| Estado | Condição | UI |
|---|---|---|
| Inicial | Nenhum arquivo | Upload zone visível, preview oculto, botão desabilitado |
| Arquivo carregado | Arquivo selecionado | Preview visível com hint de posicionamento |
| Texto posicionado | Usuário clicou no flyer | Overlay visível, hint oculto, cursor default |
| Pronto | Arquivo + campos + posição | Botão ativo |
| Baixando | html2canvas em execução | Botão com loading state |

---

## Tratamento de PDF

- `pdfjs-dist` configurado com worker via CDN ou arquivo local em `/public`
- Renderiza somente a primeira página (`pdf.getPage(1)`)
- Escala 2x para qualidade adequada
- Output: dataURL → usado como `src` da imagem do preview

---

## Design system (referência)

Seguir exatamente o HTML de referência fornecido:
- Font: Plus Jakarta Sans (Google Fonts)
- Icons: Material Symbols Outlined
- Paleta: violet primary (`#4501a9` / `#5d2ec0`), surface `#fcf9f8`, containers
- Border radius: `rounded-xl` (12px), `rounded-[1.5rem]` (24px) no card principal
- Tailwind config customizado conforme modelo
