export const ORG_TABLE_FILTER_DEBOUNCE_MS = 250

export const ORG_TABLE_COLUMNS = [
  { key: 'name', label: 'Подразделение', align: 'left' },
  { key: 'level', label: 'Уровень', align: 'left' },
  { key: 'totalHeadcount', label: 'Всего сотрудников', align: 'right' },
  { key: 'totalBudget', label: 'Бюджет суммарный', align: 'right' },
  { key: 'averagePerformance', label: 'Средняя эффективность', align: 'right' },
] as const
