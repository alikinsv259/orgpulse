import { PERFORMANCE_GOOD_THRESHOLD, PERFORMANCE_WARN_THRESHOLD } from '@/entities/orgNode/model/consts'
import type { PerformanceTone } from '@/entities/orgNode/model/types'

export const getPerformanceTone = (performance: number): PerformanceTone => {
  if (performance >= PERFORMANCE_GOOD_THRESHOLD) return 'good'
  if (performance >= PERFORMANCE_WARN_THRESHOLD) return 'warn'
  return 'bad'
}
