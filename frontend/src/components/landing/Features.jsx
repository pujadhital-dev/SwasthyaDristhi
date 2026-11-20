import Icon from '../common/Icon'
import SectionHeading from './SectionHeading'

const features = [
  {
    icon: 'upload',
    title: 'Smart document intake',
    text: 'Upload notes, scanned or PDF reports and medical images. OCR, NLP and computer vision extract diagnoses, medicines and test values.',
  },
  {
    icon: 'timeline',
    title: 'Unified patient timeline',
    text: 'Every visit, test and prescription is placed in date order, so the full case can be reviewed in one scroll.',
  },
  {
    icon: 'trendingUp',
    title: 'Trend analysis',
    text: 'Lab values and vitals are charted over time, making slow changes in sugar, pressure or kidney function easy to see.',
  },
  {
    icon: 'alert',
    title: 'Explainable risk flags',
    text: 'Important changes are flagged automatically, and every flag shows exactly which results caused it.',
  },
  {
    icon: 'message',
    title: 'Case-based Q&A',
    text: 'Doctors can ask questions like “When was metformin started?” and get answers linked to the source documents.',
  },
  {
    icon: 'clipboard',
    title: 'Draft prescriptions',
    text: 'AI prepares a draft prescription from the history. The doctor edits and approves it before the patient ever sees it.',
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-slate-50 py-20 md:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Features"
          title="Everything a clinical review needs, in one place"
          description="From the first upload to an approved care plan, SwasthyaDrishti handles the paperwork so doctors can focus on the patient."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="group rounded-2xl border border-slate-200 bg-white p-7 transition duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition group-hover:bg-brand-600 group-hover:text-white">
                <Icon name={f.icon} className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
