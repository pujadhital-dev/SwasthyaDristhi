import Icon from '../common/Icon'
import SectionHeading from './SectionHeading'

const principles = [
  {
    icon: 'stethoscope',
    title: 'Doctor in the loop',
    text: 'AI suggests, the doctor decides. Nothing reaches a patient without review and approval.',
  },
  {
    icon: 'eye',
    title: 'Explainable by design',
    text: 'Every risk flag and answer links back to the reports and values it came from.',
  },
  {
    icon: 'lock',
    title: 'Private and secure',
    text: 'Records stay behind secure, token-based sign-in and are never shared publicly.',
  },
  {
    icon: 'users',
    title: 'Role-based access',
    text: 'Patients, doctors and administrators each see only what their role allows.',
  },
]

export default function Safety() {
  return (
    <section id="safety" className="relative overflow-hidden bg-brand-950 py-20 text-white md:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-brand-800)_1px,transparent_1px)] bg-size-[24px_24px] opacity-50 mask-[linear-gradient(to_bottom,black,transparent)]" />
        <div className="absolute -bottom-40 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-brand-700/30 blur-3xl" />
      </div>

      <div className="relative container-page">
        <SectionHeading
          dark
          eyebrow="Safety & trust"
          title="Clinical AI that supports judgment, never replaces it"
          description="Healthcare needs more than smart software. These principles guide every part of SwasthyaDrishti."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p) => (
            <article key={p.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.07]">
              <span className="grid size-11 place-items-center rounded-lg bg-health-500/15 text-health-400">
                <Icon name={p.icon} className="size-5" />
              </span>
              <h3 className="mt-5 font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{p.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
