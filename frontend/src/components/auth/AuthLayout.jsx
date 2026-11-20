import { Link } from 'react-router-dom'
import Logo from '../common/Logo'
import Icon from '../common/Icon'

// Split-screen layout shared by Login and Signup.
export default function AuthLayout({ title, subtitle, points, note, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-950 text-white lg:block">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(var(--color-brand-800)_1px,transparent_1px)] bg-size-[24px_24px] opacity-60" />
          <div className="absolute -top-32 -right-32 size-[30rem] rounded-full bg-brand-600/40 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 size-[26rem] rounded-full bg-health-500/20 blur-3xl" />
        </div>

        <div className="sticky top-0 flex h-screen flex-col justify-between p-12 xl:p-16">
          <Logo light />

          <div className="relative max-w-md">
            <h1 className="text-4xl leading-tight font-bold tracking-tight xl:text-5xl">{title}</h1>
            <p className="mt-4 text-lg text-slate-300">{subtitle}</p>
            <ul className="mt-10 space-y-4">
              {points.map((p) => (
                <li key={p.text} className="flex items-center gap-4">
                  <span className="grid size-10 flex-none place-items-center rounded-lg bg-white/10 text-health-400 ring-1 ring-white/15">
                    <Icon name={p.icon} className="size-5" />
                  </span>
                  <span className="text-slate-200">{p.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative flex items-center gap-2 text-sm text-slate-400">
            <Icon name="lock" className="size-4" />
            {note}
          </p>
        </div>
      </aside>

      <main className="flex flex-col bg-white">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link to="/" className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
            <Icon name="arrowRight" className="size-4 rotate-180" />
            Back to home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-10">{children}</div>
      </main>
    </div>
  )
}
