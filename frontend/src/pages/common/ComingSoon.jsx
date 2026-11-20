import { Link } from 'react-router-dom'
import Icon from '../../components/common/Icon'
import logo from '../../assets/logo.jpeg'

// Temporary placeholder for pages that are not built yet (dashboards).
export default function ComingSoon({ title }) {
  return (
    <div className="grid min-h-screen place-items-center bg-linear-to-b from-brand-50 to-white p-6 text-center">
      <div className="max-w-md">
        <Link to="/" aria-label="SwasthyaDrishti home" className="inline-block">
          <img src={logo} alt="SwasthyaDrishti" className="h-9 w-auto" />
        </Link>
        <span className="mx-auto mt-10 grid size-14 place-items-center rounded-2xl bg-brand-100 text-brand-600">
          <Icon name="clock" className="size-7" />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-500">We are building this page. It will be available soon.</p>
        <Link to="/" className="btn btn-primary mt-8">
          <Icon name="arrowRight" className="size-4 rotate-180" />
          Back to home
        </Link>
      </div>
    </div>
  )
}
