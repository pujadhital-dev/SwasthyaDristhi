import { Link } from 'react-router-dom'

// Colors come from the theme in src/index.css (fill-*/stroke-* classes)
export default function Logo({ light = false }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 text-xl ${light ? 'text-white' : 'text-primary'}`}
    >
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="19" className={light ? 'fill-white' : 'fill-primary'} />
        {/* eye shape = "Drishti" (vision) */}
        <path
          d="M7 20c3.5-6 8-9 13-9s9.5 3 13 9c-3.5 6-8 9-13 9s-9.5-3-13-9z"
          fill="none"
          strokeWidth="2.2"
          className={light ? 'stroke-primary' : 'stroke-accent-light'}
        />
        {/* medical cross = "Swasthya" (health) */}
        <path
          d="M18 14.5h4v3.5h3.5v4H22v3.5h-4V22h-3.5v-4H18z"
          className={light ? 'fill-accent' : 'fill-white'}
        />
      </svg>
      <span>
        Swasthya<strong className="font-extrabold">Drishti</strong>
      </span>
    </Link>
  )
}
