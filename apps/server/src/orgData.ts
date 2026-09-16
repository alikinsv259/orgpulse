import type { OrgNode, OrgNodePatch } from '@staff-pulse/api-contract'

type DepartmentSpec = { name: string; teams: string[] }
type DivisionSpec = { name: string; departments: DepartmentSpec[] }

const SEED = 20260915
const BASE_UPDATED_AT = Date.parse('2026-09-15T09:00:00.000Z')
const MAX_UPDATED_AT_OFFSET_MS = 72 * 60 * 60 * 1000

const ORG_STRUCTURE: DivisionSpec[] = [
  {
    name: 'Инженерия',
    departments: [
      { name: 'Платформа', teams: ['Ядро', 'Инфраструктура', 'SRE'] },
      { name: 'Продукт', teams: ['Веб', 'Мобайл', 'Дизайн-система'] },
      { name: 'Данные', teams: ['Хранилище', 'Аналитика'] },
      { name: 'Качество', teams: ['Автотесты', 'Ручное тестирование'] },
    ],
  },
  {
    name: 'Продажи',
    departments: [
      { name: 'Прямые продажи', teams: ['Корпоративные клиенты', 'СМБ'] },
      { name: 'Партнёры', teams: ['Реселлеры', 'Альянсы'] },
      { name: 'Пресейл', teams: ['Решения', 'Демо-стенды'] },
    ],
  },
  {
    name: 'Операции',
    departments: [
      { name: 'Поддержка', teams: ['Первая линия', 'Вторая линия'] },
      { name: 'Финансы', teams: ['Бухгалтерия', 'Казначейство'] },
      { name: 'Персонал', teams: ['Рекрутинг', 'Обучение'] },
    ],
  },
  {
    name: 'Маркетинг',
    departments: [
      { name: 'Бренд', teams: ['Контент', 'PR'] },
      { name: 'Рост', teams: ['Performance', 'Лайфсайкл'] },
    ],
  },
]

const createRandom = (seed: number) => {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const buildOrgNodes = (): OrgNode[] => {
  const random = createRandom(SEED)
  const intBetween = (min: number, max: number) => min + Math.floor(random() * (max - min + 1))

  const makeNode = (id: string, name: string, parentId: string | null, headcount: number): OrgNode => ({
    id,
    name,
    parentId,
    headcount,
    budget: Math.round((headcount * intBetween(900_000, 1_600_000)) / 1000) * 1000,
    performance: intBetween(45, 97),
    updatedAt: new Date(BASE_UPDATED_AT - intBetween(0, MAX_UPDATED_AT_OFFSET_MS)).toISOString(),
  })

  const nodes: OrgNode[] = []

  ORG_STRUCTURE.forEach((division, divisionIndex) => {
    const divisionId = `d${divisionIndex + 1}`
    nodes.push(makeNode(divisionId, division.name, null, intBetween(2, 4)))

    division.departments.forEach((department, departmentIndex) => {
      const departmentId = `${divisionId}-p${departmentIndex + 1}`
      nodes.push(makeNode(departmentId, department.name, divisionId, intBetween(2, 5)))

      department.teams.forEach((team, teamIndex) => {
        const teamId = `${departmentId}-t${teamIndex + 1}`
        nodes.push(makeNode(teamId, team, departmentId, intBetween(4, 18)))
      })
    })
  })

  return nodes
}

const DEFAULT_BUDGET_PER_HEAD = 1_200_000
const MAX_HEADCOUNT_DELTA = 3
const MAX_PERFORMANCE_DELTA = 8

const orgNodes = buildOrgNodes()

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const randomInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))

export const getOrgNodes = (): OrgNode[] => orgNodes

export const mutateRandomNode = (): OrgNodePatch => {
  const node = orgNodes[randomInt(0, orgNodes.length - 1)]

  const budgetPerHead = node.headcount > 0 ? Math.round(node.budget / node.headcount) : DEFAULT_BUDGET_PER_HEAD
  const headcountDelta = randomInt(-MAX_HEADCOUNT_DELTA, MAX_HEADCOUNT_DELTA)

  node.headcount = Math.max(0, node.headcount + headcountDelta)
  node.budget = Math.max(0, node.budget + headcountDelta * budgetPerHead)
  node.performance = clamp(node.performance + randomInt(-MAX_PERFORMANCE_DELTA, MAX_PERFORMANCE_DELTA), 0, 100)
  node.updatedAt = new Date().toISOString()

  return {
    id: node.id,
    headcount: node.headcount,
    budget: node.budget,
    performance: node.performance,
    updatedAt: node.updatedAt,
  }
}
