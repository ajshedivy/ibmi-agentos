'use client'

import type { SessionDetail } from '@/types/os'

interface MetricsTabProps {
  sessionData: SessionDetail | null
}

export function MetricsTab({ sessionData }: MetricsTabProps) {
  if (!sessionData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">No session selected</p>
      </div>
    )
  }

  const metrics = sessionData.metrics

  if (!metrics || (metrics.input_tokens === 0 && metrics.output_tokens === 0 && metrics.total_tokens === 0)) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">No metrics available</p>
      </div>
    )
  }

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return '0'
    return new Intl.NumberFormat('en-US').format(num)
  }

  const rows = [
    { key: 'INPUT TOKENS', value: formatNumber(metrics.input_tokens) },
    { key: 'OUTPUT TOKENS', value: formatNumber(metrics.output_tokens) },
    { key: 'TOTAL TOKENS', value: formatNumber(metrics.total_tokens) }
  ]

  return (
    <div className="p-4">
      <div className="rounded-md border border-border">
        <table className="w-full">
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  {row.key}
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
