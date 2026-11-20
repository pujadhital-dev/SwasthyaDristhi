import Navbar from '../../components/landing/Navbar'
import Hero from '../../components/landing/Hero'
import RecordTypes from '../../components/landing/RecordTypes'
import Problem from '../../components/landing/Problem'
import Features from '../../components/landing/Features'
import HowItWorks from '../../components/landing/HowItWorks'
import Audience from '../../components/landing/Audience'
import Safety from '../../components/landing/Safety'
import Faq from '../../components/landing/Faq'
import CallToAction from '../../components/landing/CallToAction'
import Footer from '../../components/landing/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <RecordTypes />
        <Problem />
        <Features />
        <HowItWorks />
        <Audience />
        <Safety />
        <Faq />
        <CallToAction />
      </main>
      <Footer />
    </>
  )
}
