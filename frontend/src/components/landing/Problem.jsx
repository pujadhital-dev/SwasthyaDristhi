import Icon from '../common/Icon'

const problems = [
  {
    icon: 'layers',
    title: 'Records are scattered',
    text: 'Reports sit in files, phones and different hospitals. Patients carry folders of paper to every visit.',
  },
  {
    icon: 'clock',
    title: 'Consultations are short',
    text: 'Doctors have minutes to read years of history, so important changes can be missed.',
  },
  {
    icon: 'search',
    title: 'Trends are hard to spot',
    text: 'A slow rise in sugar or blood pressure only becomes clear when results are compared over time.',
  },
]

export default function Problem() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <span className="eyebrow">Why SwasthyaDrishti</span>
          <h2 className="mt-3 text-3xl leading-tight font-bold tracking-tight text-balance text-slate-900 md:text-[2.5rem]">
            A medical history should not live in a bag of paper reports.
          </h2>
          <p className="mt-5 text-lg text-slate-600">
            We bring every document into one secure place, read it with AI and organize it into a
            timeline a doctor can understand in seconds, without ever taking the decision away from them.
          </p>
          <div className="mt-8 flex items-center gap-4 rounded-xl border border-health-100 bg-health-50/60 p-4">
            <span className="grid size-10 flex-none place-items-center rounded-lg bg-health-500 text-white">
              <Icon name="eye" className="size-5" />
            </span>
            <p className="text-sm text-slate-700">
              <strong className="font-semibold text-slate-900">Swasthya</strong> means health and{' '}
              <strong className="font-semibold text-slate-900">Drishti</strong> means vision. Our goal is a
              clear view of every patient’s health.
            </p>
          </div>
        </div>

        <ul className="grid gap-4">
          {problems.map((p, i) => (
            <li
              key={p.title}
              className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition hover:border-brand-200"
            >
              <span className="grid size-12 flex-none place-items-center rounded-xl bg-slate-100 text-slate-700">
                <Icon name={p.icon} className="size-6" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-400">0{i + 1}</p>
                <h3 className="text-lg font-semibold text-slate-900">{p.title}</h3>
                <p className="mt-1 text-slate-600">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
