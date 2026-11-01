import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const features = [
  {
    icon: '📄',
    title: 'Smart Document Upload',
    text: 'Upload text notes, scanned or PDF reports and medical images. OCR, NLP and computer vision pull out the key medical details.',
  },
  {
    icon: '🗓️',
    title: 'Unified Patient Timeline',
    text: 'All visits, reports and results are arranged in date order, so the whole case can be reviewed in one place.',
  },
  {
    icon: '📈',
    title: 'Trends & Risk Flags',
    text: 'Important changes in health values are spotted automatically, and every risk flag shows the reason it was raised.',
  },
  {
    icon: '🤖',
    title: 'AI-Assisted Prescriptions',
    text: 'Doctors can ask questions about a case and get a draft prescription based on the patient’s history, ready to review.',
  },
]

const steps = [
  { title: 'Upload', text: 'Patient uploads medical documents and images.' },
  { title: 'Organize', text: 'AI extracts the details and builds a chronological timeline.' },
  { title: 'Review', text: 'Doctor checks trends and risk flags, then edits the AI draft.' },
  { title: 'Approve', text: 'Only the doctor-approved prescription and care plan reach the patient.' },
]

const timeline = [
  { title: 'Blood Test Report', note: 'HbA1c 7.8% ↑' },
  { title: 'Chest X-Ray', note: 'No abnormality detected' },
  { title: 'Consultation Note', note: 'BP 150/95 mmHg' },
]

function SectionHead({ eyebrow, title }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <span className="text-sm font-bold tracking-widest text-secondary uppercase">{eyebrow}</span>
      <h2 className="mt-2.5 text-3xl font-bold text-primary md:text-4xl">{title}</h2>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        {/* ===== Hero ===== */}
        <section className="overflow-hidden bg-linear-135 from-primary to-secondary py-16 text-white md:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-block rounded-full border border-accent-light/50 bg-accent-light/25 px-3.5 py-1.5 text-sm font-semibold">
                AI-powered clinical assistant
              </span>
              <h1 className="mt-5 mb-4 text-4xl leading-tight font-extrabold md:text-5xl">
                A clear view of every{' '}
                <span className="text-accent-light">patient’s health story</span>
              </h1>
              <p className="mb-8 max-w-lg text-lg opacity-90">
                SwasthyaDrishti brings scattered reports, notes and images together
                into one organized timeline, helping doctors review faster while the
                final decision always stays with them.
              </p>
              <div className="flex flex-wrap gap-3.5">
                <Link to="/signup" className="btn btn-light px-7 py-3">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-outline px-7 py-3">
                  Login
                </Link>
              </div>
            </div>

            {/* Illustrative preview card */}
            <div className="rounded-2xl bg-white p-6 text-ink shadow-2xl" aria-hidden="true">
              <div className="flex items-center gap-3 border-b border-line pb-4">
                <div className="grid size-11 place-items-center rounded-full bg-accent-light font-bold text-primary">
                  RS
                </div>
                <div>
                  <strong>Patient Timeline</strong>
                  <small className="block text-sm text-muted">4 records · last updated today</small>
                </div>
              </div>

              <ul className="my-4 pl-1.5">
                {timeline.map((t, i) => (
                  <li key={t.title} className="relative flex gap-3.5 py-2 pl-1">
                    {i < timeline.length - 1 && (
                      <span className="absolute top-7 -bottom-2 left-2.25 w-0.5 bg-accent-light" />
                    )}
                    <span className="mt-1.5 size-3 flex-none rounded-full bg-accent ring-4 ring-light" />
                    <div>
                      <strong>{t.title}</strong>
                      <small className="block text-sm text-muted">{t.note}</small>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="rounded-lg border-l-4 border-secondary bg-light px-3.5 py-3">
                <strong className="text-sm text-primary">⚠ Risk flag: Rising blood sugar</strong>
                <small className="block text-sm text-muted">
                  HbA1c went up from 6.9% to 7.8% over 6 months
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Features ===== */}
        <section id="features" className="py-16 md:py-22">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHead eyebrow="Features" title="Everything a clinical review needs, in one place" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <article
                  key={f.title}
                  className="rounded-xl border border-line bg-white px-5 py-7 transition hover:-translate-y-1 hover:border-accent-light hover:shadow-card"
                >
                  <div className="mb-4 grid size-13 place-items-center rounded-xl bg-accent/20 text-2xl">
                    {f.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-primary">{f.title}</h3>
                  <p className="text-[0.95rem] text-muted">{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section id="how-it-works" className="bg-light py-16 md:py-22">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHead eyebrow="How it works" title="From scattered records to an approved care plan" />
            <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} className="rounded-xl bg-white px-5 py-7 text-center shadow-sm">
                  <span className="mb-3.5 inline-grid size-11 place-items-center rounded-full bg-primary text-lg font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mb-1.5 text-lg font-bold text-primary">{s.title}</h3>
                  <p className="text-[0.95rem] text-muted">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ===== Who it's for ===== */}
        <section id="about" className="py-16 md:py-22">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHead eyebrow="Who it’s for" title="Built for patients and doctors" />
            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-xl border border-line bg-light p-8">
                <h3 className="mb-3.5 text-2xl font-bold text-primary">For Patients</h3>
                <ul className="list-disc space-y-2 pl-5 marker:text-accent">
                  <li>Upload reports, notes and images</li>
                  <li>Keep your full medical history in one place</li>
                  <li>View approved prescriptions and care plans</li>
                </ul>
              </article>
              <article className="rounded-xl bg-secondary p-8 text-white">
                <h3 className="mb-3.5 text-2xl font-bold">For Doctors</h3>
                <ul className="list-disc space-y-2 pl-5 marker:text-accent-light">
                  <li>Review a chronological patient timeline</li>
                  <li>See trends and risk flags with clear reasons</li>
                  <li>Ask questions and review AI-drafted prescriptions</li>
                </ul>
              </article>
            </div>
            <p className="mx-auto mt-8 max-w-3xl rounded-xl bg-accent-light/25 px-5 py-4 text-center font-medium text-primary">
              🔒 The doctor stays in control at every step. No AI suggestion reaches a
              patient without the doctor’s review and approval.
            </p>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="bg-primary py-16 text-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6">
            <h2 className="text-2xl font-bold md:text-3xl">Ready to organize your medical history?</h2>
            <Link to="/signup" className="btn btn-light">
              Create a Patient Account
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
