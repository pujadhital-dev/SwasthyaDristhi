import { Link } from 'react-router-dom'
import Icon from '../common/Icon'

export default function CallToAction() {
  return (
    <section className="pb-20 md:pb-28">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-linear-120 from-brand-600 via-brand-700 to-brand-900 px-6 py-14 text-center text-white sm:px-12 md:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -left-20 size-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -right-16 -bottom-24 size-80 rounded-full bg-health-400/25 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl leading-tight font-bold tracking-tight text-balance md:text-[2.5rem]">
              Bring your medical history together today
            </h2>
            <p className="mt-4 text-lg text-brand-100">
              Create a free patient account in a minute and give your doctor the complete picture at your next visit.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/signup" className="btn btn-white btn-lg">
                Get started free
                <Icon name="arrowRight" className="size-4" />
              </Link>
              <Link to="/login" className="btn btn-outline-white btn-lg">
                I already have an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
