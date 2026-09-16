import { EMPTY_ORG_SEARCH_FILTER, type OrgSearchFilter } from '@staff-pulse/api-contract'

type Metric = 'headcount' | 'budget' | 'performance'

type Range = [number, number]

const WORD_START = '(?<![а-яёa-z])'
const WORD_END = '(?![а-яёa-z])'

const LEVEL_PATTERNS: { pattern: RegExp; level: number }[] = [
  { pattern: new RegExp(`${WORD_START}дивизион[а-яё]*${WORD_END}`, 'g'), level: 1 },
  { pattern: new RegExp(`${WORD_START}отдел[а-яё]*${WORD_END}`, 'g'), level: 2 },
  { pattern: new RegExp(`${WORD_START}команд[а-яё]*${WORD_END}`, 'g'), level: 3 },
]

const METRIC_PATTERNS: { pattern: RegExp; metric: Metric }[] = [
  { pattern: new RegExp(`${WORD_START}(эффективн[а-яё]*|performance)${WORD_END}`, 'g'), metric: 'performance' },
  {
    pattern: new RegExp(
      `${WORD_START}(сотрудник[а-яё]*|человек[а-яё]*|людей|численност[а-яё]*|штат[а-яё]*|headcount)${WORD_END}`,
      'g',
    ),
    metric: 'headcount',
  },
  { pattern: new RegExp(`${WORD_START}(бюджет[а-яё]*|budget)${WORD_END}`, 'g'), metric: 'budget' },
]

const CONSTRAINT_PATTERN = new RegExp(
  `(?:${WORD_START}(больше|более|выше|свыше|от|меньше|менее|ниже|до)${WORD_END}|(>=|<=|>|<))\\s*(\\d+(?:[.,\\s]\\d+)*)\\s*(млрд|млн|тыс|k|%)?`,
  'g',
)

const LESS_COMPARATORS = new Set(['меньше', 'менее', 'ниже', 'до', '<', '<='])

const UNIT_MULTIPLIERS: Record<string, number> = {
  'млрд': 1_000_000_000,
  'млн': 1_000_000,
  'тыс': 1_000,
  k: 1_000,
}

const MIN_FREE_TEXT_WORD_LENGTH = 2

const STOP_WORDS = new Set([
  'а', 'без', 'более', 'больше', 'в', 'во', 'все', 'всех', 'выше', 'где', 'для', 'до', 'за', 'и',
  'из', 'или', 'их', 'к', 'которые', 'который', 'которых', 'между', 'менее', 'меньше', 'мне', 'на',
  'над', 'найди', 'найдите', 'найти', 'нам', 'не', 'ниже', 'но', 'о', 'об', 'от', 'по', 'под',
  'пожалуйста', 'покажи', 'показать', 'при', 'с', 'свыше', 'со', 'список', 'у', 'чем', 'что',
])

const parseAmount = (raw: string, unit: string | undefined): number | null => {
  const normalized = raw.replace(/\s/g, '').replace(',', '.')
  const value = Number.parseFloat(normalized)

  if (!Number.isFinite(value)) return null

  return value * (unit ? (UNIT_MULTIPLIERS[unit] ?? 1) : 1)
}

const findNearestMetric = (mentions: { metric: Metric; index: number }[], index: number): Metric | null => {
  let nearest: { metric: Metric; distance: number } | null = null

  for (const mention of mentions) {
    const distance = Math.abs(mention.index - index)

    if (!nearest || distance < nearest.distance) nearest = { metric: mention.metric, distance }
  }

  return nearest?.metric ?? null
}

const applyConstraint = (filter: OrgSearchFilter, metric: Metric, isLess: boolean, value: number): void => {
  if (metric === 'headcount') {
    if (isLess) filter.headcountMax = value
    else filter.headcountMin = value
    return
  }

  if (metric === 'budget') {
    if (isLess) filter.budgetMax = value
    else filter.budgetMin = value
    return
  }

  if (isLess) filter.performanceMax = Math.min(value, 100)
  else filter.performanceMin = Math.min(value, 100)
}

const stripRanges = (source: string, ranges: Range[]): string => {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0])

  let result = ''
  let cursor = 0

  for (const [start, end] of sorted) {
    if (start < cursor) continue

    result += source.slice(cursor, start)
    cursor = end
  }

  return result + source.slice(cursor)
}

const extractFreeText = (source: string, ranges: Range[]): string | null => {
  const words = stripRanges(source, ranges)
    .split(/[^а-яёa-z0-9-]+/i)
    .map((word) => word.trim())
    .filter((word) => word.length >= MIN_FREE_TEXT_WORD_LENGTH && !STOP_WORDS.has(word))

  return words.length > 0 ? words.join(' ') : null
}

export const parseSearchQueryLocally = (query: string): OrgSearchFilter => {
  const normalized = query.trim().toLowerCase()

  if (normalized.length === 0) return { ...EMPTY_ORG_SEARCH_FILTER }

  const filter: OrgSearchFilter = { ...EMPTY_ORG_SEARCH_FILTER }
  const consumed: Range[] = []

  const levels = new Set<number>()

  for (const { pattern, level } of LEVEL_PATTERNS) {
    for (const match of normalized.matchAll(pattern)) {
      levels.add(level)
      consumed.push([match.index, match.index + match[0].length])
    }
  }

  const metricMentions: { metric: Metric; index: number }[] = []

  for (const { pattern, metric } of METRIC_PATTERNS) {
    for (const match of normalized.matchAll(pattern)) {
      metricMentions.push({ metric, index: match.index })
      consumed.push([match.index, match.index + match[0].length])
    }
  }

  let hasConstraint = false

  for (const match of normalized.matchAll(CONSTRAINT_PATTERN)) {
    const [raw, wordComparator, symbolComparator, rawAmount, unit] = match
    const metric = findNearestMetric(metricMentions, match.index)
    const amount = parseAmount(rawAmount, unit)

    if (!metric || amount === null) continue

    applyConstraint(filter, metric, LESS_COMPARATORS.has(wordComparator ?? symbolComparator), amount)
    hasConstraint = true
    consumed.push([match.index, match.index + raw.length])
  }

  if (levels.size > 0) filter.levels = [...levels].sort((a, b) => a - b)

  const hasStructuredSignal = levels.size > 0 || hasConstraint

  filter.text = hasStructuredSignal ? extractFreeText(normalized, consumed) : normalized

  return filter
}
