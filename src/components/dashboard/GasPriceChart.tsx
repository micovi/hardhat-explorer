import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, TrendingUp, TrendingDown } from 'lucide-react'

interface GasPriceData {
  current: number
  average: number
  low: number
  high: number
  trend: 'up' | 'down' | 'stable'
  history: { time: string; value: number }[]
}

interface GasPriceChartProps {
  data: GasPriceData
}

export default function GasPriceChart({ data }: GasPriceChartProps) {
  const maxGas = Math.max(...data.history.map(h => h.value), data.high)
  const minGas = Math.min(...data.history.map(h => h.value), data.low)
  
  const getLineHeight = (value: number) => {
    const range = maxGas - minGas
    if (range === 0) return 50
    return 100 - ((value - minGas) / range) * 80
  }

  const createPath = () => {
    if (data.history.length === 0) return ''
    
    const points = data.history.map((point, index) => {
      const x = (index / (data.history.length - 1)) * 100
      const y = getLineHeight(point.value)
      return `${x},${y}`
    })
    
    return `M ${points.join(' L ')}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Gas Price</CardTitle>
          <Badge variant={data.trend === 'up' ? 'destructive' : data.trend === 'down' ? 'success' : 'secondary'}>
            {data.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
            {data.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
            {data.trend}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{data.current} Gwei</p>
                <p className="text-xs text-gray-500">Current price</p>
              </div>
            </div>
          </div>

          {/* Mini Chart */}
          <div className="h-20 relative">
            {data.history.length > 0 ? (
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="20" x2="100" y2="20" stroke="#f3f4f6" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#f3f4f6" strokeWidth="0.5" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="#f3f4f6" strokeWidth="0.5" />
                
                {/* Line chart */}
                <path
                  d={createPath()}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                
                {/* Dots for data points */}
                {data.history.map((point, index) => (
                  <circle
                    key={index}
                    cx={(index / (data.history.length - 1)) * 100}
                    cy={getLineHeight(point.value)}
                    r="2"
                    fill="#3b82f6"
                  />
                ))}
              </svg>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <p className="text-xs">No data</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            <div>
              <p className="text-xs text-gray-500">Low</p>
              <p className="font-semibold text-sm">{data.low} Gwei</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Average</p>
              <p className="font-semibold text-sm">{data.average} Gwei</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">High</p>
              <p className="font-semibold text-sm">{data.high} Gwei</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}