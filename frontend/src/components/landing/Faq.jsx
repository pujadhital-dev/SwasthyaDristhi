import Icon from '../common/Icon'
import SectionHeading from './SectionHeading'

const faqs = [
  {
    q: 'Does the AI write prescriptions on its own?',
    a: 'No. The AI only prepares a draft based on the patient’s history. A doctor reviews, edits and approves it, and only the approved version is shared with the patient.',
  },
  {
    q: 'What kind of documents can I upload?',
    a: 'Typed or handwritten doctor notes, scanned or PDF lab reports, prescriptions and medical images such as X-rays. Clear photos taken on a phone also work.',
  },
  {
    q: 'Who can see my medical records?',
    a: 'Only you and the doctors involved in your care. Access is controlled by role, so each person sees only what they need.',
  },
  {
    q: 'What does a risk flag mean?',
    a: 'A risk flag highlights a change worth a closer look, such as blood sugar rising across several tests. Each flag shows the exact values that triggered it so the doctor can judge it quickly.',
  },
]

export default function Faq() {
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <SectionHeading
          align="left"
          eyebrow="FAQ"
          title="Questions, answered"
          description="Can’t find what you are looking for? Reach out to the SwasthyaDrishti support team."
        />

        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {faqs.map((f, i) => (
            <details key={f.q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                {f.q}
                <span className="grid size-8 flex-none place-items-center rounded-full bg-slate-100 text-slate-600 transition group-open:rotate-180 group-open:bg-brand-50 group-open:text-brand-600">
                  <Icon name="chevronDown" className="size-4" />
                </span>
              </summary>
              <p className="mt-3 pr-12 leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
