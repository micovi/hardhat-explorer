import { Github, Star, ExternalLink, Heart, Zap, Code } from 'lucide-react'
import { Button } from './ui/button'

export function FooterSection() {
  return (
    <footer className="py-24 px-6 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,1) 1px, transparent 0)',
          backgroundSize: '30px 30px'
        }} />
      </div>
      
      <div className="max-w-6xl mx-auto relative">
        {/* Main footer content */}
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div className="group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-3 h-3 border border-white rounded-sm"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">evmscan</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Open source blockchain explorer for local EVM development. 
              Built with modern web technologies and developer experience in mind.
            </p>
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Zero setup</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <Code className="h-4 w-4 text-blue-500" />
              <span>Developer first</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="group/btn hover:bg-gray-900 hover:text-white transition-all duration-200"
              >
                <a 
                  href="https://github.com/your-org/evmscan" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <Github className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                  <span>GitHub</span>
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                asChild
                className="group/btn hover:bg-yellow-400 hover:text-gray-900 hover:border-yellow-400 transition-all duration-200"
              >
                <a 
                  href="https://github.com/your-org/evmscan" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <Star className="h-4 w-4 group-hover/btn:scale-125 transition-transform" />
                  <span>Star</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Documentation */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h4>
            <ul className="space-y-3 text-gray-600">
              {[
                { label: 'Getting Started', href: '#' },
                { label: 'Configuration', href: '#' },
                { label: 'API Reference', href: '#' },
                { label: 'Contributing', href: '#' }
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="hover:text-gray-900 transition-all duration-200 flex items-center group hover:translate-x-1"
                  >
                    <span className="group-hover:border-b group-hover:border-gray-900 pb-0.5">
                      {link.label}
                    </span>
                    <ExternalLink className="h-3 w-3 ml-2 group-hover:rotate-12 group-hover:scale-110 transition-transform" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Community</h4>
            <ul className="space-y-3 text-gray-600">
              {[
                { label: 'Discord', href: '#', color: 'hover:text-indigo-600' },
                { label: 'Twitter', href: '#', color: 'hover:text-blue-500' },
                { label: 'Issues', href: '#', color: 'hover:text-red-600' },
                { label: 'Discussions', href: '#', color: 'hover:text-green-600' }
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className={`${link.color} transition-all duration-200 flex items-center group hover:translate-x-1`}
                  >
                    <span className="group-hover:border-b border-current pb-0.5">
                      {link.label}
                    </span>
                    <ExternalLink className="h-3 w-3 ml-2 group-hover:rotate-12 group-hover:scale-110 transition-transform" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Open Source Sponsors Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-lg font-semibold text-gray-900 mb-2">
              <Heart className="h-5 w-5 text-red-500 animate-pulse" fill="currentColor" />
              <span>Proudly Open Source</span>
            </div>
            <p className="text-sm text-gray-500">
              Supported by the developer community
            </p>
          </div>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            {/* Placeholder sponsor logos with hover effects */}
            {['Sponsor A', 'Sponsor B', 'Sponsor C'].map((sponsor, index) => (
              <div 
                key={index}
                className="text-gray-600 text-sm bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                {sponsor}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="gradient-separator mb-8"></div>
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <p>&copy; 2025 evmscan.org</p>
            <span className="w-1 h-1 bg-gray-300 rounded-full animate-pulse"></span>
            <p>Licensed under MIT</p>
          </div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900 transition-all duration-200 hover:scale-105">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-all duration-200 hover:scale-105">Terms</a>
            <div className="flex items-center space-x-1">
              <span>Built with</span>
              <Heart className="h-3 w-3 text-red-500 animate-pulse mx-1" fill="currentColor" />
              <span>for developers</span>
            </div>
          </div>
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-10 right-10 w-4 h-4 bg-gray-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-2 h-2 bg-gray-300 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-3 h-3 border border-gray-300 rounded opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
    </footer>
  )
}