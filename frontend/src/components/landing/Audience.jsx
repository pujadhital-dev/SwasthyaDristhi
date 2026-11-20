import { Link } from 'react-router-dom'
import Icon from '../common/Icon'
import SectionHeading from './SectionHeading'

const patientPoints = [
  'Upload reports, scans and prescriptions in seconds',
  'Keep your full medical history in one secure place',
  'Share your records with your doctor before the visit',
  'View doctor-approved prescriptions and care plans',
]

const doctorPoints = [
  'Read a clear, chronological patient timeline',
  'Spot trends with charts of lab values and vitals',
  'See risk flags with the reason behind each one',
  'Ask case questions and refine AI-drafted prescriptions',
]

function Checklist({ items, dark }) {
  return (
    <ul className="mt-6 space-y-3.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            className={`mt-0.5 grid size-5 flex-none place-items-center rounded-full ${
              dark ? 'bg-health-500/20 text-health-400' : 'bg-brand-100 text-brand-700'
            }`}
          >
            <Icon name="check" className="size-3.5" strokeWidth={2.5} />
          </span>
          <span className={dark ? 'text-slate-200' : 'text-slate-700'}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function Audience() {
  return (
    <section id="audience" className="bg-slate-50 py-20 md:py-28">
      <div className="container-page">
        <SectionHeading eyebrow="Who it’s for" title="Built for patients and the doctors who care for them" />

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 md:p-10">
            <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Icon name="user" className="size-6" />
            </span>
            <h3 className="mt-5 text-2xl font-bold text-slate-900">For patients</h3>
            <p className="mt-2 text-slate-600">Stop carrying files to every appointment. Your history is always ready.</p>
            <Checklist items={patientPoints} />
            <div className="mt-auto pt-8">
              <Link to="/signup" className="btn btn-primary">
                Create patient account
                <Icon name="arrowRight" className="size-4" />
              </Link>
            </div>
          </article>

          <article className="relative flex flex-col overflow-hidden rounded-3xl bg-brand-950 p-8 text-white md:p-10">
            <div aria-hidden="true" className="absolute -top-24 -right-24 size-72 rounded-full bg-brand-600/40 blur-3xl" />
            <span className="relative grid size-12 place-items-center rounded-xl bg-white/10 text-health-400 ring-1 ring-white/15">
              <Icon name="stethoscope" className="size-6" />
            </span>
            <h3 className="relative mt-5 text-2xl font-bold">For doctors</h3>
            <p className="relative mt-2 text-slate-300">Understand a complex case in minutes, not after reading every page.</p>
            <div className="relative">
              <Checklist items={doctorPoints} dark />
            </div>
            <div className="relative mt-auto pt-8">
              <Link to="/login" className="btn btn-white">
                Doctor login
                <Icon name="arrowRight" className="size-4" />
              </Link>
              <p className="mt-3 text-sm text-slate-400">Doctor accounts are created by the hospital administrator.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
