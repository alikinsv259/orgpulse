import type { FC } from 'react'
import styled from 'styled-components'

import { ORG_NODE_LEVEL_LABELS, PerformanceDot } from '@/entities/orgNode'
import { formatBudget, formatCount, formatPerformance } from '@/shared/lib'
import { HighlightOnChange } from '@/shared/ui'
import type { OrgTableRow as OrgTableRowModel } from '@/widgets/orgTable/model'

const Row = styled.tr<{ $isSelected: boolean }>`
  cursor: pointer;
  background: ${({ theme, $isSelected }) => ($isSelected ? theme.color.accentSoft : 'transparent')};
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme, $isSelected }) => ($isSelected ? theme.color.accentSoft : theme.color.surfaceHover)};
  }
`

const Cell = styled.td`
  padding: ${({ theme }) => `${theme.space(2)} ${theme.space(3)}`};
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  font-size: ${({ theme }) => theme.fontSize.sm};
  white-space: nowrap;
`

const NameCell = styled(Cell)`
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
`

const LevelCell = styled(Cell)`
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.xs};
`

const NumberCell = styled(Cell)`
  text-align: right;
  font-variant-numeric: tabular-nums;
`

const PerformanceValue = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.space(2)};
`

type Props = {
  row: OrgTableRowModel
  isSelected: boolean
  isFocused: boolean
  isLive: boolean
  onSelect: (id: string) => void
  onFocus: () => void
  registerRef: (id: string, element: HTMLTableRowElement | null) => void
}

export const OrgTableRow: FC<Props> = ({ row, isSelected, isFocused, isLive, onSelect, onFocus, registerRef }) => (
  <Row
    ref={(element) => {
      registerRef(row.id, element)
    }}
    $isSelected={isSelected}
    tabIndex={isFocused ? 0 : -1}
    aria-current={isSelected ? 'true' : undefined}
    onClick={() => onSelect(row.id)}
    onFocus={onFocus}
  >
    <NameCell title={row.name}>{row.name}</NameCell>
    <LevelCell>{ORG_NODE_LEVEL_LABELS[row.level] ?? `Уровень ${row.level}`}</LevelCell>
    <NumberCell>
      <HighlightOnChange value={row.totalHeadcount} isEnabled={isLive}>
        {formatCount(row.totalHeadcount)}
      </HighlightOnChange>
    </NumberCell>
    <NumberCell>
      <HighlightOnChange value={row.totalBudget} isEnabled={isLive}>
        {formatBudget(row.totalBudget)}
      </HighlightOnChange>
    </NumberCell>
    <NumberCell>
      <HighlightOnChange value={row.averagePerformance} isEnabled={isLive}>
        <PerformanceValue>
          <PerformanceDot performance={row.averagePerformance} withValue={false} />
          {formatPerformance(row.averagePerformance)}
        </PerformanceValue>
      </HighlightOnChange>
    </NumberCell>
  </Row>
)
