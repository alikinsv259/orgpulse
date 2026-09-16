import type { OrgSearchFilter } from '@staff-pulse/api-contract'

const ALL_LEVELS = [1, 2, 3]

/**
 * Модель иногда возвращает ограничения, которые ничего не ограничивают: пустой массив
 * уровней, все три уровня разом или пустую строку в text. Приводим такие значения к null,
 * иначе «фильтр не пустой» перестаёт что-либо значить.
 */
export const normalizeOrgSearchFilter = (filter: OrgSearchFilter): OrgSearchFilter => {
  const text = filter.text?.trim()

  const levels =
    filter.levels && filter.levels.length > 0 && !ALL_LEVELS.every((level) => filter.levels?.includes(level))
      ? filter.levels
      : null

  return {
    ...filter,
    text: text && text.length > 0 ? text : null,
    levels,
  }
}
