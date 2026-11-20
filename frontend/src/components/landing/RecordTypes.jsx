import Icon from '../common/Icon'

const types = [
  { icon: 'fileText', label: 'Doctor notes' },
  { icon: 'scan', label: 'Scanned & PDF reports' },
  { icon: 'flask', label: 'Lab results' },
  { icon: 'image', label: 'X-rays & medical images' },
  { icon: 'pill', label: 'Prescriptions' },
]

// Strip directly under the hero: what can be uploaded.
export default function RecordTypes() {
  return (
    <section aria-label="Supported records" className="border-y border-slate-200 bg-slate-50/70">
      <div className="container-page flex flex-col items-center gap-5 py-8 lg:flex-row lg:justify-between">
        <p className="shrink-0 text-sm font-semibold text-slate-500">Works with every kind of medical record</p>
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {types.map((t) => (
            <li key={t.label} className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Icon name={t.icon} className="size-5 text-brand-600" />
              {t.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
