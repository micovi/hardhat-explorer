import { TerminalHero } from './components/terminal-hero'
import { InteractiveFeatures } from './components/interactive-features'
import { OnlineDemoBanner } from './components/online-demo-banner'
import { FooterSection } from './components/footer-section'

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <TerminalHero />
      <InteractiveFeatures />
      <OnlineDemoBanner />
      <FooterSection />
    </div>
  )
}

export default App