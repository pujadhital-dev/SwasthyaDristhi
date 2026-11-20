import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../common/Logo'
import Icon from '../common/Icon'

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#audience', label: 'For patients & doctors' },
  { href: '#safety', label: 'Safety' },
  { href: '#faq', label: 'FAQ' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
        scrolled || open ? 'border-slate-200 bg-white/90 backdrop-blur-md' : 'border-transparent bg-white/0'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6 md:h-18">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/login" className="btn px-4 text-slate-700 hover:bg-slate-100">
            Log in
          </Link>
          <Link to="/signup" className="btn btn-primary px-4">
            Get started
            <Icon name="arrowRight" className="size-4" />
          </Link>
        </div>

        <button
          type="button"
          className="-mr-2 grid size-10 cursor-pointer place-items-center rounded-md text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'close' : 'menu'} className="size-6" />
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white lg:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col py-3">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 font-medium text-slate-700 hover:bg-slate-50"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 pb-2">
              <Link to="/login" className="btn btn-secondary">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Get started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
