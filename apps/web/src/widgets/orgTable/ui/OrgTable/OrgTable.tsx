import { type FC, type KeyboardEvent, useRef, useState } from 'react'
import styled from 'styled-components'

import type { OrgNodeAggregates, OrgTreeNode } from '@/entities/orgNode'
import { formatCount, useDebouncedValue } from '@/shared/lib'
import { TextField } from '@/shared/ui'
import { useOrgTableRows } from '@/widgets/orgTable/hooks'
import {
  ORG_TABLE_COLUMNS,
  ORG_TABLE_FILTER_DEBOUNCE_MS,
  type OrgTableSort,
  type OrgTableSortKey,
} from '@/widgets/orgTable/model'
import { OrgTableRow } from '@/widgets/orgTable/ui/OrgTableRow'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(3)};
  padding: ${({ theme }) => theme.space(3)};
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
`

const RowCount = styled.span`
  flex: 0 0 auto;
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-variant-numeric: tabular-nums;
`

const Scroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const HeadCell = styled.th<{ $align: 'left' | 'right' }>`
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme }) => theme.color.surface};
  text-align: ${({ $align }) => $align};
  font-weight: 500;
`

const SortButton = styled.button<{ $align: 'left' | 'right'; $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $align }) => ($align === 'right' ? 'flex-end' : 'flex-start')};
  gap: ${({ theme }) => theme.space(1.5)};
  width: 100%;
  padding: ${({ theme }) => `${theme.space(3)} ${theme.space(3)}`};
  border: none;
  background: transparent;
  color: ${({ theme, $isActive }) => ($isActive ? theme.color.text : theme.color.textMuted)};
  font-size: ${({ theme }) => theme.fontSize.xs};
  text-align: inherit;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.color.text};
  }
`

const SortIndicator = styled.span<{ $isActive: boolean }>`
  opacity: ${({ $isActive }) => ($isActive ? 1 : 0.35)};
`

const EmptyCell = styled.td`
  padding: ${({ theme }) => theme.space(10)};
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-align: center;
`

const ariaSortOf = (sort: OrgTableSort | null, key: OrgTableSortKey) => {
  if (sort?.key !== key) return 'none'

  return sort.direction === 'asc' ? 'ascending' : 'descending'
}

type Props = {
  nodes: OrgTreeNode[]
  aggregates: OrgNodeAggregates
  selectedId: string | null
  liveUpdatedIds: Set<string>
  onSelect: (id: string) => void
}

export const OrgTable: FC<Props> = ({ nodes, aggregates, selectedId, liveUpdatedIds, onSelect }) => {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<OrgTableSort | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  const rowElements = useRef(new Map<string, HTMLTableRowElement>())

  const debouncedSearch = useDebouncedValue(search, ORG_TABLE_FILTER_DEBOUNCE_MS)
  const rows = useOrgTableRows({ nodes, aggregates, search: debouncedSearch, sort })

  const activeIndex = Math.min(focusedIndex, Math.max(rows.length - 1, 0))

  const registerRef = (id: string, element: HTMLTableRowElement | null) => {
    if (element) rowElements.current.set(id, element)
    else rowElements.current.delete(id)
  }

  const focusRowAt = (index: number) => {
    const clampedIndex = Math.min(Math.max(index, 0), rows.length - 1)
    const row = rows[clampedIndex]

    if (!row) return

    setFocusedIndex(clampedIndex)
    rowElements.current.get(row.id)?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTableSectionElement>) => {
    if (rows.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusRowAt(activeIndex + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        focusRowAt(activeIndex - 1)
        break
      case 'Home':
        event.preventDefault()
        focusRowAt(0)
        break
      case 'End':
        event.preventDefault()
        focusRowAt(rows.length - 1)
        break
      case 'Enter': {
        event.preventDefault()
        const row = rows[activeIndex]
        if (row) onSelect(row.id)
        break
      }
      default:
        break
    }
  }

  const handleSort = (key: OrgTableSortKey) => {
    setSort((prev) =>
      prev?.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' },
    )
  }

  return (
    <Wrapper>
      <Toolbar>
        <TextField
          type="search"
          value={search}
          placeholder="Фильтр по названию"
          aria-label="Фильтр по названию"
          onChange={(event) => setSearch(event.target.value)}
        />
        <RowCount>
          {formatCount(rows.length)} из {formatCount(nodes.length)}
        </RowCount>
      </Toolbar>

      <Scroll>
        <Table>
          <thead>
            <tr>
              {ORG_TABLE_COLUMNS.map((column) => {
                const isActive = sort?.key === column.key

                return (
                  <HeadCell
                    key={column.key}
                    scope="col"
                    $align={column.align}
                    aria-sort={ariaSortOf(sort, column.key)}
                  >
                    <SortButton
                      type="button"
                      $align={column.align}
                      $isActive={isActive}
                      onClick={() => handleSort(column.key)}
                    >
                      {column.label}
                      <SortIndicator $isActive={isActive} aria-hidden="true">
                        {isActive && sort.direction === 'desc' ? '▼' : '▲'}
                      </SortIndicator>
                    </SortButton>
                  </HeadCell>
                )
              })}
            </tr>
          </thead>

          <tbody onKeyDown={handleKeyDown}>
            {rows.length === 0 ? (
              <tr>
                <EmptyCell colSpan={ORG_TABLE_COLUMNS.length}>Ничего не найдено</EmptyCell>
              </tr>
            ) : (
              rows.map((row, index) => (
                <OrgTableRow
                  key={row.id}
                  row={row}
                  isSelected={row.id === selectedId}
                  isFocused={index === activeIndex}
                  isLive={liveUpdatedIds.has(row.id)}
                  onSelect={onSelect}
                  onFocus={() => setFocusedIndex(index)}
                  registerRef={registerRef}
                />
              ))
            )}
          </tbody>
        </Table>
      </Scroll>
    </Wrapper>
  )
}
