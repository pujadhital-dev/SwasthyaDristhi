import Icon from '../common/Icon'
import SectionHeading from './SectionHeading'

const steps = [
  { icon: 'upload', title: 'Upload', text: 'The patient uploads reports, prescriptions and images from phone or computer.' },
  { icon: 'sparkles', title: 'Organize', text: 'AI reads each document, extracts the key details and builds a timeline.' },
  { icon: 'stethoscope', title: 'Review', text: 'The doctor checks trends and risk flags, asks questions and edits the AI draft.' },
  { icon: 'shield', title: 'Approve', text: 'Only the doctor-approved prescription and care plan are shared with the patient.' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="How it works"
          title="From scattered records to an approved care plan"
          description="Four simple steps, with the doctor in control of the final one."
        />

        <ol className="relative grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* connector line (desktop) */}
          <div
            aria-hidden="true"
            className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-px bg-linear-to-r from-brand-200 via-brand-300 to-health-400 lg:block"
          />
          {steps.map((s, i) => (
            <li key={s.title} className="relative text-center">
              <div className="relative mx-auto grid size-14 place-items-center rounded-2xl border border-brand-100 bg-white text-brand-600 shadow-soft">
                <Icon name={s.icon} className="size-6" />
                <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white ring-4 ring-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-slate-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
