import { Zap, Shield, Code } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Zero Configuration',
    description: 'Works out of the box with any EVM chain. No complex setup or API keys required.'
  },
  {
    icon: Shield,
    title: 'Fully Local',
    description: 'All data stays on your machine. Perfect for private networks and development.'
  },
  {
    icon: Code,
    title: 'Developer First',
    description: 'Built for developers, by developers. Clean UI, fast performance, open source.'
  }
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Why evmscan?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The simplest way to explore your local blockchain during development
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="feature-card text-center group">
                <div className="mb-6 flex justify-center">
                  <div className="p-3 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <Icon className="h-8 w-8 text-gray-900" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Separator */}
        <div className="mt-24">
          <div className="gradient-separator"></div>
        </div>
      </div>
    </section>
  )
}