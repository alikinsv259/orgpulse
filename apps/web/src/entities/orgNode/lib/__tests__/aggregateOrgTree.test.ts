import type { OrgNode } from '@staff-pulse/api-contract'
import { describe, expect, it } from 'vitest'

import { aggregateOrgTree } from '@/entities/orgNode/lib/aggregateOrgTree'
import { applyOrgNodePatch } from '@/entities/orgNode/lib/applyOrgNodePatch'
import { createOrgSnapshot } from '@/entities/orgNode/lib/createOrgSnapshot'

const UPDATED_AT = '2026-09-15T09:00:00.000Z'

const node = (
  id: string,
  parentId: string | null,
  headcount: number,
  budget: number,
  performance: number,
): OrgNode => ({ id, name: id, parentId, headcount, budget, performance, updatedAt: UPDATED_AT })

/**
 * d1 ─ d1-p1 ─ d1-p1-t1
 *    │        └ d1-p1-t2
 *    └ d1-p2 (нулевая численность)
 * d2 (лист-корень)
 */
const NODES: OrgNode[] = [
  node('d1', null, 2, 2_000_000, 50),
  node('d1-p1', 'd1', 3, 3_000_000, 60),
  node('d1-p1-t1', 'd1-p1', 10, 10_000_000, 90),
  node('d1-p1-t2', 'd1-p1', 5, 5_000_000, 40),
  node('d1-p2', 'd1', 0, 0, 70),
  node('d2', null, 1, 1_000_000, 80),
]

const aggregatesOf = (nodes: OrgNode[]) => aggregateOrgTree(createOrgSnapshot(nodes).tree)

describe('aggregateOrgTree', () => {
  it('у листа агрегат совпадает с собственными значениями', () => {
    const leaf = aggregatesOf(NODES).get('d1-p1-t1')

    expect(leaf).toEqual({
      totalHeadcount: 10,
      totalBudget: 10_000_000,
      weightedPerformance: 900,
      averagePerformance: 90,
    })
  })

  it('суммирует узел и всех его потомков', () => {
    const aggregates = aggregatesOf(NODES)

    expect(aggregates.get('d1')?.totalHeadcount).toBe(20)
    expect(aggregates.get('d1')?.totalBudget).toBe(20_000_000)
    expect(aggregates.get('d1-p1')?.totalHeadcount).toBe(18)
    expect(aggregates.get('d1-p1')?.totalBudget).toBe(18_000_000)
  })

  it('средняя эффективность взвешена по headcount, а не арифметическая', () => {
    const aggregates = aggregatesOf(NODES)

    // (2×50 + 3×60 + 10×90 + 5×40 + 0×70) / 20 = 1380 / 20
    expect(aggregates.get('d1')?.averagePerformance).toBe(69)

    const plainMean = (50 + 60 + 90 + 40 + 70) / 5
    expect(aggregates.get('d1')?.averagePerformance).not.toBe(plainMean)
  })

  it('при нулевой численности отдаёт 0, а не NaN', () => {
    const empty = aggregatesOf(NODES).get('d1-p2')

    expect(empty?.totalHeadcount).toBe(0)
    expect(empty?.averagePerformance).toBe(0)
  })

  it('покрывает каждый узел ровно один раз', () => {
    const aggregates = aggregatesOf(NODES)
    const rootsTotal = ['d1', 'd2'].reduce((sum, id) => sum + (aggregates.get(id)?.totalHeadcount ?? 0), 0)

    expect(aggregates.size).toBe(NODES.length)
    expect(rootsTotal).toBe(NODES.reduce((sum, item) => sum + item.headcount, 0))
  })

  it('не ломается на пустом списке и на узле с потерянным родителем', () => {
    expect(aggregatesOf([]).size).toBe(0)

    const orphan = aggregatesOf([node('lost', 'missing-parent', 7, 7_000_000, 30)])
    expect(orphan.get('lost')?.totalHeadcount).toBe(7)
  })
})

describe('applyOrgNodePatch', () => {
  const patch = {
    id: 'd1-p1-t1',
    headcount: 20,
    budget: 30_000_000,
    performance: 50,
    updatedAt: '2026-09-16T10:00:00.000Z',
  }

  it('инкрементальный пересчёт совпадает с полным', () => {
    const patched = applyOrgNodePatch(createOrgSnapshot(NODES), patch)
    const fromScratch = aggregateOrgTree(patched.tree)

    for (const [id, incremental] of patched.aggregates) {
      expect(incremental).toEqual(fromScratch.get(id))
    }
  })

  it('трогает только сам узел и его предков', () => {
    const base = createOrgSnapshot(NODES)
    const patched = applyOrgNodePatch(base, patch)

    const changed = [...patched.aggregates.entries()]
      .filter(([id, aggregate]) => base.aggregates.get(id) !== aggregate)
      .map(([id]) => id)

    expect(changed.sort()).toEqual(['d1', 'd1-p1', 'd1-p1-t1'])
  })

  it('игнорирует патч не новее текущего состояния', () => {
    const base = createOrgSnapshot(NODES)
    const stale = applyOrgNodePatch(base, { ...patch, updatedAt: '2020-01-01T00:00:00.000Z' })

    expect(stale).toBe(base)
  })

  it('игнорирует патч для неизвестного узла', () => {
    const base = createOrgSnapshot(NODES)

    expect(applyOrgNodePatch(base, { ...patch, id: 'nope' })).toBe(base)
  })
})
