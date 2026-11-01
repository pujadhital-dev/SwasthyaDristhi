import { Link } from 'react-router-dom'
import Logo from './Logo'

const YEAR = new Date().getFullYear()

const linkClass = 'block py-1 transition hover:text-white'
const headingClass = 'mb-3 text-sm font-semibold tracking-wider text-accent-light uppercase'

export default function Footer() {
  return (
    <footer className="bg-primary-dark pt-14 pb-6 text-white/85">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-3.5 max-w-sm text-[0.95rem]">
            An AI-powered clinical assistant giving patients and doctors a clear,
            organized view of every medical history.
          </p>
        </div>

        <div>
          <h4 className={headingClass}>Platform</h4>
          <a href="#features" className={linkClass}>Features</a>
          <a href="#how-it-works" className={linkClass}>How it works</a>
          <a href="#about" className={linkClass}>About</a>
        </div>

        <div>
          <h4 className={headingClass}>Account</h4>
          <Link to="/login" className={linkClass}>Login</Link>
          <Link to="/signup" className={linkClass}>Patient Sign Up</Link>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-6 border-t border-white/15 px-6 pt-5 text-sm opacity-80 md:flex-row md:justify-between">
        <p>
          SwasthyaDrishti assists clinical review. It does not replace professional
          medical judgment. Every prescription is reviewed and approved by a doctor.
        </p>
        <p className="shrink-0">© {YEAR} SwasthyaDrishti</p>
      </div>
    </footer>
  )
}
