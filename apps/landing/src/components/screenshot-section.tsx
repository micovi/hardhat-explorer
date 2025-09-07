export function ScreenshotSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            See it in action
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Clean, familiar interface that feels like Etherscan but works with your local development setup
          </p>
        </div>

        {/* MacBook Mockup */}
        <div className="relative max-w-5xl mx-auto">
          <div className="mockup-macbook">
            <div className="mockup-screen">
              {/* Screenshot placeholder - we'll replace this with actual screenshot */}
              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                {/* Simulated UI elements */}
                <div className="absolute inset-4 rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="h-12 bg-gray-200 flex items-center px-4 border-b border-gray-300">
                    <div className="flex space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="text-xs text-gray-600 bg-gray-300 rounded px-3 py-1 inline-block">
                        localhost:3000
                      </div>
                    </div>
                  </div>
                  
                  {/* Main content simulation */}
                  <div className="flex-1 bg-white p-6">
                    {/* Navigation */}
                    <div className="flex space-x-6 mb-8 text-sm">
                      <div className="text-black font-medium border-b-2 border-black pb-2">Transactions</div>
                      <div className="text-gray-500 pb-2">Blocks</div>
                      <div className="text-gray-500 pb-2">Accounts</div>
                    </div>
                    
                    {/* Stats cards */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded p-3">
                          <div className="h-2 bg-gray-300 rounded mb-2"></div>
                          <div className="h-4 bg-gray-400 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Transaction list simulation */}
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-gray-50 rounded p-4 flex items-center space-x-4">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-3 bg-gray-400 rounded w-1/3 mb-2"></div>
                            <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                          </div>
                          <div className="h-3 bg-gray-400 rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Overlay gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-200/20 to-transparent"></div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-gray-700/20 to-transparent rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-gray-600/20 to-transparent rounded-full blur-xl"></div>
        </div>

        {/* Feature highlights below screenshot */}
        <div className="mt-16 grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Real-time Updates</h3>
            <p className="text-gray-600">
              See new transactions and blocks as they happen on your local network
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contract Interaction</h3>
            <p className="text-gray-600">
              Read and write to smart contracts directly from the explorer interface
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}