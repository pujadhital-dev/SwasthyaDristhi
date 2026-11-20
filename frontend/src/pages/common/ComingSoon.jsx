import { Link } from 'react-router-dom'
import Logo from '../../components/common/Logo'
import Icon from '../../components/common/Icon'

// Temporary placeholder for pages that are not built yet (dashboards).
export default function ComingSoon({ title }) {
  return (
    <div className="grid min-h-screen place-items-center bg-linear-to-b from-brand-50 to-white p-6 text-center">
      <div className="max-w-md">
        <Logo />
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
