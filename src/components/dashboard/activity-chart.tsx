import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Blocks } from 'lucide-react'

interface DataPoint {
  label: string
  blocks: number
  transactions: number
  timestamp: number
}

interface ActivityChartProps {
  data: DataPoint[]
}

export default function ActivityChart({ data }: ActivityChartProps) {
  const maxValue = useMemo(() => {
    return Math.max(
      ...data.map(d => d.blocks),
      ...data.map(d => d.transactions)
    )
  }, [data])

  const getBarHeight = (value: number) => {
    if (maxValue === 0) return 0
    return (value / maxValue) * 100
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Network Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-gray-600">Blocks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span className="text-gray-600">Transactions</span>
            </div>
          </div>

          {/* Chart */}
          <div className="h-48 flex items-end gap-2">
            {data.length > 0 ? (
              data.map((point, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex gap-1 items-end h-40 w-full">
                    <div 
                      className="flex-1 bg-blue-500 rounded-t transition-all duration-500"
                      style={{ height: `${getBarHeight(point.blocks)}%` }}
                      title={`${point.blocks} blocks`}
                    />
                    <div 
                      className="flex-1 bg-purple-500 rounded-t transition-all duration-500"
                      style={{ height: `${getBarHeight(point.transactions)}%` }}
                      title={`${point.transactions} transactions`}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {point.label}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No activity data yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}