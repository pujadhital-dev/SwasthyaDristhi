import Icon from '../common/Icon'

// Illustrative sample data only – not a real patient.
const hba1c = [
  { m: 'Jan', v: 6.8 },
  { m: 'Feb', v: 7.0 },
  { m: 'Mar', v: 7.1 },
  { m: 'Apr', v: 7.3 },
  { m: 'May', v: 7.5 },
  { m: 'Jun', v: 7.8 },
]

const vitals = [
  { label: 'HbA1c', value: '7.8%', status: 'Above target', tone: 'rose' },
  { label: 'Blood pressure', value: '148/94', status: 'Elevated', tone: 'amber' },
  { label: 'SpO₂', value: '98%', status: 'Normal', tone: 'health' },
]

const toneClass = {
  rose: 'bg-rose-50 text-rose-700',
  amber: 'bg-amber-50 text-amber-700',
  health: 'bg-health-50 text-health-700',
}

const timeline = [
  { date: '12 Jun', title: 'Lab report · HbA1c, lipid panel', icon: 'flask' },
  { date: '28 May', title: 'OPD visit · Endocrinology', icon: 'stethoscope' },
  { date: '03 Apr', title: 'Chest X-ray uploaded', icon: 'image' },
]

function TrendChart() {
  const W = 320
  const H = 110
  const min = 6.5
  const max = 8.0
  const x = (i) => 8 + (i * (W - 16)) / (hba1c.length - 1)
  const y = (v) => H - 8 - ((v - min) / (max - min)) * (H - 24)
  const pts = hba1c.map((d, i) => [x(i), y(d.v)])
  const line = pts.map((p) => p.join(',')).join(' ')
  const area = `M${pts[0][0]},${H} L${pts.map((p) => p.join(',')).join(' L')} L${pts.at(-1)[0]},${H} Z`
  const last = pts.at(-1)

  return (
    <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full" role="img" aria-label="HbA1c rising from 6.8% to 7.8% over six months">
      <defs>
        <linearGradient id="previewTrend" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="8" x2={W - 8} y1={y(7)} y2={y(7)} strokeDasharray="4 4" stroke="var(--color-slate-300)" />
      <text x={W - 8} y={y(7) - 6} textAnchor="end" fontSize="9" fill="var(--color-slate-500)">
        Target 7.0%
      </text>
      <path d={area} fill="url(#previewTrend)" />
      <polyline points={line} fill="none" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" stroke="var(--color-brand-600)" />
      <circle cx={last[0]} cy={last[1]} r="9" fill="var(--color-rose-500)" opacity="0.18" />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill="var(--color-rose-500)" stroke="#fff" strokeWidth="2" />
      {hba1c.map((d, i) => (
        <text key={d.m} x={x(i)} y={H + 14} textAnchor="middle" fontSize="9" fill="var(--color-slate-500)">
          {d.m}
        </text>
      ))}
    </svg>
  )
}

export default function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:mr-0" aria-hidden="true">
      {/* window frame */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-2 shadow-lift backdrop-blur">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-3">
            <span className="size-2.5 rounded-full bg-slate-200" />
            <span className="size-2.5 rounded-full bg-slate-200" />
            <span className="size-2.5 rounded-full bg-slate-200" />
            <span className="ml-3 rounded-md bg-slate-100 px-2.5 py-0.5 text-[0.7rem] text-slate-500">
              Doctor workspace · Patient overview
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-full bg-brand-100 font-bold text-brand-700">RS</div>
                <div>
                  <p className="font-semibold text-slate-900">Ram Sharma</p>
                  <p className="text-xs text-slate-500">Male · 54 yrs · Type 2 diabetes · 14 records</p>
                </div>
              </div>
              <span className="hidden rounded-full bg-health-50 px-2.5 py-1 text-[0.7rem] font-semibold text-health-700 sm:inline">
                Synced today
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[1.4fr_1fr]">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-semibold text-slate-800">HbA1c trend</p>
                  <p className="text-[0.7rem] font-semibold text-rose-600">↑ 1.0% in 6 mo</p>
                </div>
                <TrendChart />
              </div>

              <div className="rounded-xl border border-slate-100 p-3.5">
                <p className="mb-3 text-sm font-semibold text-slate-800">Timeline</p>
                <ol className="space-y-3">
                  {timeline.map((t) => (
                    <li key={t.title} className="flex gap-2.5">
                      <span className="grid size-7 flex-none place-items-center rounded-md bg-brand-50 text-brand-600">
                        <Icon name={t.icon} className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-800">{t.title}</p>
                        <p className="text-[0.68rem] text-slate-500">{t.date}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {vitals.map((v) => (
                <div key={v.label} className="rounded-lg border border-slate-100 p-2.5">
                  <p className="truncate text-[0.68rem] text-slate-500">{v.label}</p>
                  <p className="font-bold text-slate-900">{v.value}</p>
                  <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[0.62rem] font-semibold ${toneClass[v.tone]}`}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* floating: explainable risk flag */}
      <div className="absolute -top-6 -left-6 hidden w-64 rounded-xl border border-rose-100 bg-white p-3.5 shadow-soft sm:block xl:-left-14">
        <div className="flex items-start gap-3">
          <span className="grid size-8 flex-none place-items-center rounded-lg bg-rose-50 text-rose-600">
            <Icon name="alert" className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Risk flag: glycaemic control</p>
            <p className="mt-0.5 text-xs leading-snug text-slate-500">
              Why: HbA1c rose in 5 consecutive tests and is 0.8% above target.
            </p>
          </div>
        </div>
      </div>

      {/* floating: AI draft awaiting approval */}
      <div className="absolute -right-4 -bottom-8 hidden w-64 rounded-xl border border-slate-200 bg-white p-3.5 shadow-soft sm:block xl:-right-10">
        <div className="flex items-start gap-3">
          <span className="grid size-8 flex-none place-items-center rounded-lg bg-brand-50 text-brand-600">
            <Icon name="sparkles" className="size-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">AI draft prescription</p>
            <p className="mt-0.5 text-xs text-slate-500">Waiting for doctor review</p>
            <div className="mt-2.5 flex gap-2">
              <span className="rounded-md bg-brand-600 px-2 py-1 text-[0.65rem] font-semibold text-white">Review</span>
              <span className="rounded-md border border-slate-200 px-2 py-1 text-[0.65rem] font-semibold text-slate-600">Edit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
