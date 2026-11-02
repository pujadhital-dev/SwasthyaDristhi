import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const features = [
  {
    icon: '📄',
    title: 'Smart Document Upload',
    text: 'Upload text notes, scanned or PDF reports and medical images. OCR, NLP and computer vision pull out the key medical details.',
  },
  {
    icon: '🗓️',
    title: 'Unified Patient Timeline',
    text: 'All visits, reports and results are arranged in date order, so the whole case can be reviewed in one place.',
  },
  {
    icon: '📈',
    title: 'Trends & Risk Flags',
    text: 'Important changes in health values are spotted automatically, and every risk flag shows the reason it was raised.',
  },
  {
    icon: '🤖',
    title: 'AI-Assisted Prescriptions',
    text: 'Doctors can ask questions about a case and get a draft prescription based on the patient’s history, ready to review.',
  },
]

const steps = [
  { title: 'Upload', text: 'Patient uploads medical documents and images.' },
  { title: 'Organize', text: 'AI extracts the details and builds a chronological timeline.' },
  { title: 'Review', text: 'Doctor checks trends and risk flags, then edits the AI draft.' },
  { title: 'Approve', text: 'Only the doctor-approved prescription and care plan reach the patient.' },
]

// Sample data for the hero preview (illustrative only)
const hba1c = [
  { m: 'Jan', v: 6.9 },
  { m: 'Feb', v: 7.0 },
  { m: 'Mar', v: 7.2 },
  { m: 'Apr', v: 7.3 },
  { m: 'May', v: 7.6 },
  { m: 'Jun', v: 7.8 },
]

const vitals = [
  { label: 'HbA1c', value: '7.8%', status: 'High', alert: true },
  { label: 'Blood Pressure', value: '150/95', status: 'High', alert: true },
  { label: 'SpO₂', value: '98%', status: 'Normal', alert: false },
]

const trustPoints = ['Doctor-approved care plans', 'Explainable risk flags', 'Secure medical records']

// Simple SVG line chart for the HbA1c trend
function TrendChart() {
  const W = 300
  const H = 120
  const min = 6.5
  const max = 8.0
  const x = (i) => 12 + (i * (W - 24)) / (hba1c.length - 1)
  const y = (v) => H - 14 - ((v - min) / (max - min)) * (H - 28)
  const line = hba1c.map((d, i) => `${x(i)},${y(d.v)}`).join(' ')
  const area = `M${x(0)},${H - 14} L${line.replaceAll(' ', ' L')} L${x(hba1c.length - 1)},${H - 14} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H + 14}`} className="w-full">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="[stop-color:var(--color-accent)]" stopOpacity="0.35" />
          <stop offset="100%" className="[stop-color:var(--color-accent)]" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* target line at 7.0% */}
      <line x1="12" x2={W - 12} y1={y(7)} y2={y(7)} strokeDasharray="4 4" strokeWidth="1" className="stroke-muted/50" />
      <text x={W - 12} y={y(7) - 5} textAnchor="end" className="fill-muted text-[9px]">
        Target 7.0%
      </text>
      <path d={area} fill="url(#trendFill)" />
      <polyline points={line} fill="none" strokeWidth="2.5" strokeLinejoin="round" className="stroke-primary" />
      {hba1c.map((d, i) => (
        <g key={d.m}>
          <circle
            cx={x(i)}
            cy={y(d.v)}
            r={i === hba1c.length - 1 ? 5 : 3.5}
            strokeWidth="2"
            className={i === hba1c.length - 1 ? 'fill-red-500 stroke-white' : 'fill-white stroke-primary'}
          />
          <text x={x(i)} y={H + 10} textAnchor="middle" className="fill-muted text-[9px]">
            {d.m}
          </text>
        </g>
      ))}
    </svg>
  )
}

function SectionHead({ eyebrow, title }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <span className="text-sm font-bold tracking-widest text-secondary uppercase">{eyebrow}</span>
      <h2 className="mt-2.5 text-3xl font-bold text-primary md:text-4xl">{title}</h2>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        {/* ===== Hero ===== */}
        <section className="relative overflow-hidden bg-light py-16 md:py-24">
          {/* soft decorative background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-line)_1px,transparent_1px)] bg-size-[22px_22px] mask-[linear-gradient(to_bottom,black,transparent)]"
          />
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-accent-light/50 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full bg-accent-light/30 blur-3xl" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 md:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-semibold text-primary shadow-sm">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent" />
                </span>
                AI-powered clinical assistant
              </span>

              <h1 className="mt-6 mb-5 text-4xl leading-tight font-extrabold text-ink md:text-[3.25rem]">
                Every report.
                <br />
                <span className="relative whitespace-nowrap text-primary">
                  One clear picture.
                  <svg aria-hidden="true" viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full">
                    <path d="M2 9c50-6 146-8 196-3" fill="none" strokeWidth="4" strokeLinecap="round" className="stroke-accent" />
                  </svg>
                </span>
              </h1>

              <p className="mb-8 max-w-lg text-lg text-muted">
                SwasthyaDrishti turns scattered reports, notes and scans into an organized
                patient timeline with trends and risk flags, so doctors can review faster
                while the final decision always stays with them.
              </p>

              <div className="flex flex-wrap gap-3.5">
                <Link to="/signup" className="btn btn-primary px-7 py-3 shadow-card">
                  Get Started
                  <span aria-hidden="true">→</span>
                </Link>
                <a href="#how-it-works" className="btn btn-ghost px-7 py-3">
                  See how it works
                </a>
              </div>

              <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2.5 text-sm font-medium text-ink">
                {trustPoints.map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="grid size-5 place-items-center rounded-full bg-primary text-[0.7rem] text-white">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Illustrative dashboard preview */}
            <div className="relative mx-auto w-full max-w-md sm:py-14" aria-hidden="true">
              <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-full bg-primary font-bold text-white">RS</div>
                    <div>
                      <strong className="text-ink">Ram Sharma</strong>
                      <small className="block text-sm text-muted">Male · 54 yrs · 12 records</small>
                    </div>
                  </div>
                  <span className="rounded-md bg-light px-2.5 py-1 text-xs font-semibold text-primary">Updated today</span>
                </div>

                <div className="mt-5 rounded-xl bg-light/70 p-3.5">
                  <div className="mb-1 flex items-baseline justify-between">
                    <strong className="text-sm text-ink">HbA1c trend</strong>
                    <span className="text-xs font-semibold text-red-600">↑ 0.9% in 6 months</span>
                  </div>
                  <TrendChart />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  {vitals.map((v) => (
                    <div key={v.label} className="rounded-lg border border-line p-2.5">
                      <small className="block text-[0.7rem] text-muted">{v.label}</small>
                      <strong className="block text-ink">{v.value}</strong>
                      <span className={`text-[0.7rem] font-semibold ${v.alert ? 'text-red-600' : 'text-primary'}`}>
                        {v.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* floating: risk flag */}
              <div className="absolute top-0 -left-4 hidden w-56 rounded-xl border border-red-100 bg-white p-3 shadow-lg sm:block md:-left-10">
                <div className="flex items-start gap-2.5">
                  <span className="grid size-8 flex-none place-items-center rounded-lg bg-red-50 text-red-600">⚠</span>
                  <div>
                    <strong className="block text-sm text-ink">Risk flag raised</strong>
                    <small className="text-xs text-muted">Blood sugar rising steadily</small>
                  </div>
                </div>
              </div>

              {/* floating: AI draft awaiting review */}
              <div className="absolute -right-4 bottom-0 hidden w-60 rounded-xl border border-line bg-white p-3 shadow-lg sm:block md:-right-8">
                <div className="flex items-start gap-2.5">
                  <span className="grid size-8 flex-none place-items-center rounded-lg bg-accent-light/60 text-primary">✎</span>
                  <div>
                    <strong className="block text-sm text-ink">AI draft prescription</strong>
                    <small className="text-xs text-muted">Awaiting doctor review</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Features ===== */}
        <section id="features" className="py-16 md:py-22">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHead eyebrow="Features" title="Everything a clinical review needs, in one place" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <article
                  key={f.title}
                  className="rounded-xl border border-line bg-white px-5 py-7 transition hover:-translate-y-1 hover:border-accent-light hover:shadow-card"
                >
                  <div className="mb-4 grid size-13 place-items-center rounded-xl bg-accent/20 text-2xl">
                    {f.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-primary">{f.title}</h3>
                  <p className="text-[0.95rem] text-muted">{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section id="how-it-works" className="bg-light py-16 md:py-22">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHead eyebrow="How it works" title="From scattered records to an approved care plan" />
            <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} className="rounded-xl bg-white px-5 py-7 text-center shadow-sm">
                  <span className="mb-3.5 inline-grid size-11 place-items-center rounded-full bg-primary text-lg font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mb-1.5 text-lg font-bold text-primary">{s.title}</h3>
                  <p className="text-[0.95rem] text-muted">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ===== Who it's for ===== */}
        <section id="about" className="py-16 md:py-22">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHead eyebrow="Who it’s for" title="Built for patients and doctors" />
            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-xl border border-line bg-light p-8">
                <h3 className="mb-3.5 text-2xl font-bold text-primary">For Patients</h3>
                <ul className="list-disc space-y-2 pl-5 marker:text-accent">
                  <li>Upload reports, notes and images</li>
                  <li>Keep your full medical history in one place</li>
                  <li>View approved prescriptions and care plans</li>
                </ul>
              </article>
              <article className="rounded-xl bg-secondary p-8 text-white">
                <h3 className="mb-3.5 text-2xl font-bold">For Doctors</h3>
                <ul className="list-disc space-y-2 pl-5 marker:text-accent-light">
                  <li>Review a chronological patient timeline</li>
                  <li>See trends and risk flags with clear reasons</li>
                  <li>Ask questions and review AI-drafted prescriptions</li>
                </ul>
              </article>
            </div>
            <p className="mx-auto mt-8 max-w-3xl rounded-xl bg-accent-light/25 px-5 py-4 text-center font-medium text-primary">
              🔒 The doctor stays in control at every step. No AI suggestion reaches a
              patient without the doctor’s review and approval.
            </p>
          </div>
        </section>

      
      </main>

      <Footer />
    </>
  )
}
