import { Link } from 'react-router-dom'
import Icon from '../common/Icon'
import DashboardPreview from './DashboardPreview'

const highlights = ['Doctor-approved care plans', 'Explainable risk flags', 'Private, role-based access']

export default function Hero() {
  return (
    // Negative top margin lets the hero background sit behind the transparent sticky navbar.
    <section className="relative -mt-16 overflow-hidden pt-16 md:-mt-18 md:pt-18">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-b from-brand-50 via-white to-white" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-brand-100)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-brand-100)_1px,transparent_1px)] bg-size-[56px_56px] opacity-60 mask-[radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-40 right-[-10%] size-[36rem] rounded-full bg-brand-200/50 blur-3xl" />
        <div className="absolute top-1/3 left-[-15%] size-[28rem] rounded-full bg-health-100/60 blur-3xl" />
      </div>

      <div className="container-page grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 py-1 pr-3 pl-1 text-sm font-medium text-slate-700 shadow-xs">
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">New</span>
            AI clinical assistant for patients & doctors
          </span>

          <h1 className="mt-6 text-4xl leading-[1.1] font-extrabold tracking-tight text-balance text-slate-900 sm:text-5xl lg:text-[3.6rem]">
            See the complete health story{' '}
            <span className="bg-linear-to-r from-brand-600 to-health-600 bg-clip-text text-transparent">
              in one clear view.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-slate-600">
            SwasthyaDrishti turns scattered reports, prescriptions and scans into an organized
            medical timeline with trends and explainable risk flags. Doctors review cases faster,
            and every clinical decision stays in their hands.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Create free patient account
              <Icon name="arrowRight" className="size-4" />
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">
              See how it works
            </a>
          </div>

          <ul className="mt-10 grid gap-3 text-sm font-medium text-slate-700 sm:flex sm:flex-wrap sm:gap-x-6">
            {highlights.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-health-100 text-health-700">
                  <Icon name="check" className="size-3.5" strokeWidth={2.5} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <DashboardPreview />
      </div>
    </section>
  )
}
