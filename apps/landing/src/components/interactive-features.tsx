import { useState } from 'react'
import { Zap, Shield, Code, ArrowRight, Check } from 'lucide-react'

const features = [
  {
    id: 'zero-config',
    icon: Zap,
    title: 'Zero Configuration',
    subtitle: 'Works instantly',
    description: 'Drop-in replacement that automatically detects your local EVM node and starts indexing blocks immediately.',
    benefits: ['Auto-detects Hardhat, Anvil, Ganache', 'No API keys or setup required', 'Smart contract verification'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'fully-local',
    icon: Shield,
    title: 'Fully Local',
    subtitle: 'Private & secure',
    description: 'Everything runs on your machine. Perfect for private networks, testnets, and sensitive development work.',
    benefits: ['No external dependencies', 'Offline-first architecture', 'Your data stays yours'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'developer-first',
    icon: Code,
    title: 'Developer Experience',
    subtitle: 'Built for devs',
    description: 'Clean, fast interface with powerful developer tools. Contract interaction, debugging, and more.',
    benefits: ['One-click contract calls', 'Transaction debugging', 'Real-time updates'],
    color: 'from-purple-500 to-pink-500'
  }
]

export function InteractiveFeatures() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Why choose evmscan?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for local blockchain development, 
            without the complexity of traditional block explorers.
          </p>
        </div>

        {/* Interactive features grid */}
        <div className="grid lg:grid-cols-3 gap-8 relative">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isHovered = hoveredFeature === feature.id
            const isActive = activeFeature === feature.id
            const isElevated = isHovered || isActive

            return (
              <div
                key={feature.id}
                className={`
                  relative group cursor-pointer transition-all duration-500 ease-out
                  ${isElevated ? 'scale-105 z-10' : 'scale-100'}
                  ${index === 1 ? 'lg:-mt-8' : ''}
                  ${index === 2 ? 'lg:-mt-4' : ''}
                `}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
                onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
              >
                {/* Card */}
                <div className={`
                  bg-white border-2 rounded-2xl p-8 shadow-lg transition-all duration-500 hover-lift relative overflow-hidden
                  ${isElevated ? 'border-gray-900 shadow-2xl' : 'border-gray-100 shadow-md hover:shadow-lg'}
                  ${isActive ? 'ring-4 ring-gray-900 ring-opacity-10' : ''}
                `}>
                  {/* Subtle shimmer effect on hover */}
                  {isElevated && (
                    <div className="absolute inset-0 shimmer opacity-20 pointer-events-none"></div>
                  )}
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className={`
                      p-3 rounded-xl transition-all duration-300 relative overflow-hidden
                      ${isElevated ? 'bg-gray-900 text-white scale-110' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}
                    `}>
                      <Icon className={`h-8 w-8 transition-transform duration-300 ${isElevated ? 'rotate-12' : ''}`} />
                      {isElevated && (
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/10"></div>
                      )}
                    </div>
                    <div className={`
                      transition-all duration-300 transform cursor-pointer
                      ${isActive ? 'rotate-180 scale-110' : 'rotate-0 hover:scale-105'}
                    `}>
                      <ArrowRight className={`h-5 w-5 transition-colors duration-200 ${
                        isElevated ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                      }`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 relative z-10">
                    <div>
                      <h3 className={`text-2xl font-bold mb-2 transition-colors duration-200 ${
                        isElevated ? 'text-gray-900' : 'text-gray-900 group-hover:text-gray-700'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm font-medium transition-colors duration-200 ${
                        isElevated ? 'text-gray-700' : 'text-gray-500 group-hover:text-gray-600'
                      }`}>
                        {feature.subtitle}
                      </p>
                    </div>

                    <p className={`leading-relaxed transition-colors duration-200 ${
                      isElevated ? 'text-gray-700' : 'text-gray-600 group-hover:text-gray-700'
                    }`}>
                      {feature.description}
                    </p>

                    {/* Expandable benefits */}
                    <div className={`
                      overflow-hidden transition-all duration-500 ease-out
                      ${isActive ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
                    `}>
                      <div className="pt-4 border-t border-gray-100">
                        <ul className="space-y-2">
                          {feature.benefits.map((benefit, i) => (
                            <li 
                              key={i} 
                              className="flex items-center gap-3 text-sm text-gray-700 slide-in-left"
                              style={{ animationDelay: `${i * 100}ms` }}
                            >
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0 bounce-subtle" 
                                style={{ animationDelay: `${i * 200}ms` }} />
                              <span className="hover:text-gray-900 transition-colors cursor-default">
                                {benefit}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Bottom gradient accent */}
                  <div className={`
                    absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transition-all duration-300
                    bg-gradient-to-r ${feature.color}
                    ${isElevated ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}
                  `} />
                </div>

                {/* Floating elements */}
                <div className={`
                  absolute -top-2 -right-2 w-4 h-4 bg-gray-900 rounded-full transition-all duration-300 breathe
                  ${isElevated ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
                `} />
                <div className={`
                  absolute -bottom-1 -left-1 w-2 h-2 bg-gray-300 rounded-full transition-all duration-500
                  ${isElevated ? 'scale-100 opacity-60' : 'scale-0 opacity-0'}
                `} style={{ animationDelay: '200ms' }} />
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 mb-8">
            <div className="w-16 h-px bg-gray-200 breathe" />
            <span className="hover:text-gray-700 transition-colors cursor-default">Ready to get started?</span>
            <div className="w-16 h-px bg-gray-200 breathe" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-900 text-white rounded-lg px-6 py-4 font-mono text-sm max-w-md mx-auto hover-lift group cursor-pointer relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-blue-400 group-hover:text-blue-300 transition-colors">$</span>
                <span className="group-hover:text-gray-100 transition-colors"> npx evmscan init && npx evmscan start</span>
              </div>
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <p className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-default">
              Get up and running in under 30 seconds
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}