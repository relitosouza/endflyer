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
