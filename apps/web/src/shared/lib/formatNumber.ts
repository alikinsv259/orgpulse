const NBSP = ' '

const countFormatter = new Intl.NumberFormat('ru-RU')

const performanceFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export const formatCount = (value: number): string => countFormatter.format(value).replace(/\s/g, NBSP)

export const formatBudget = (value: number): string => `${formatCount(Math.round(value))}${NBSP}руб.`

export const formatPerformance = (value: number): string => performanceFormatter.format(value)
