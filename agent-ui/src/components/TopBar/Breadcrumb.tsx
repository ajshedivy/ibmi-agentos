'use client'
import { useStore } from '@/store'

export function Breadcrumb() {
  const { activeSection } = useStore()

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  return (
    <div className="text-sm text-muted">
      {capitalize(activeSection)}
    </div>
  )
}
