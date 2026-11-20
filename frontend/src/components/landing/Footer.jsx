import { Link } from 'react-router-dom'
import Logo from '../common/Logo'
import Icon from '../common/Icon'

const YEAR = new Date().getFullYear()

const columns = [
  {
    title: 'Platform',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Safety & trust', href: '#safety' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Log in', to: '/login' },
      { label: 'Patient sign up', to: '/signup' },
      { label: 'Doctor login', to: '/login' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '#' },
      { label: 'Terms of service', href: '#' },
      { label: 'Medical disclaimer', href: '#' },
    ],
  },
]

const linkClass = 'text-sm text-slate-400 transition hover:text-white'

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div className="max-w-sm">
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            An AI-powered clinical assistant that gives patients and doctors a clear, organized view of
            every medical history.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-400">
            <Icon name="shield" className="size-4 text-health-400" />
            Every prescription is approved by a doctor
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-white">{col.title}</h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <Link to={l.to} className={linkClass}>
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className={linkClass}>
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p className="max-w-3xl">
            SwasthyaDrishti assists clinical review and does not replace professional medical judgment.
            In an emergency, contact your nearest hospital immediately.
          </p>
          <p className="shrink-0">© {YEAR} SwasthyaDrishti. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
