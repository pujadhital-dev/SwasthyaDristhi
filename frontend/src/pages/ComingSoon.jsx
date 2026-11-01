import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

// Temporary placeholder for pages that are not built yet (signup, dashboards).
export default function ComingSoon({ title }) {
  return (
    <div className="grid min-h-screen place-items-center bg-light p-6 text-center">
      <div>
        <Logo />
        <h1 className="mt-6 mb-2 text-3xl font-bold text-primary">{title}</h1>
        <p className="text-muted">This page is coming soon.</p>
        <Link to="/" className="btn btn-primary mt-4">
          Back to home
        </Link>
      </div>
    </div>
  )
}
