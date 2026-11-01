import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

const links = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#about', label: 'About' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-lg">
      <div className="mx-auto flex h-17 max-w-6xl items-center justify-between px-6">
        <Logo light />

        {/* Mobile menu button */}
        <button
          type="button"
          className="flex cursor-pointer flex-col gap-1.5 p-1.5 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="h-0.5 w-6 rounded bg-white" />
          <span className="h-0.5 w-6 rounded bg-white" />
          <span className="h-0.5 w-6 rounded bg-white" />
        </button>

        <nav
          className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-17 flex-col gap-1 bg-primary px-6 pt-3 pb-5
            md:static md:flex md:flex-row md:items-center md:gap-7 md:p-0`}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-2.5 font-medium opacity-90 transition hover:text-accent-light hover:opacity-100 md:py-0"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-2 flex gap-2.5 md:mt-0">
            <Link to="/login" className="btn btn-outline flex-1 px-4 py-2 md:flex-none">
              Login
            </Link>
            <Link to="/signup" className="btn btn-light flex-1 px-4 py-2 md:flex-none">
              Sign Up
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
