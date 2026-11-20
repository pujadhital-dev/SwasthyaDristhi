export default function SectionHeading({ eyebrow, title, description, align = 'center', dark = false }) {
  const centered = align === 'center'
  return (
    <div className={`mb-12 max-w-2xl md:mb-16 ${centered ? 'mx-auto text-center' : ''}`}>
      <span className={`eyebrow ${dark ? 'text-health-400' : ''}`}>{eyebrow}</span>
      <h2
        className={`mt-3 text-3xl leading-tight font-bold tracking-tight text-balance md:text-[2.5rem] ${
          dark ? 'text-white' : 'text-slate-900'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-lg text-pretty ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{description}</p>
      )}
    </div>
  )
}
