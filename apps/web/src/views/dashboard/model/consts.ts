import type { DashboardView } from '@/views/dashboard/model/types'

export const SPLIT_VIEW_MEDIA_QUERY = '(min-width: 1280px)'

export const DASHBOARD_VIEW_OPTIONS: { value: DashboardView; label: string }[] = [
  { value: 'tree', label: 'Дерево' },
  { value: 'table', label: 'Таблица' },
]
