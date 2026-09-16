import type { FC, KeyboardEvent } from 'react'
import styled from 'styled-components'

import { ORG_NODE_LEVEL_LABELS, PerformanceDot } from '@/entities/orgNode'
import { formatBudget, formatCount, formatPerformance } from '@/shared/lib'
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
  onSelect: (id: string) => void
}

export const OrgTableRow: FC<Props> = ({ row, isSelected, onSelect }) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    onSelect(row.id)
  }

  return (
    <Row
      $isSelected={isSelected}
      tabIndex={0}
      aria-current={isSelected ? 'true' : undefined}
      onClick={() => onSelect(row.id)}
      onKeyDown={handleKeyDown}
    >
      <NameCell title={row.name}>{row.name}</NameCell>
      <LevelCell>{ORG_NODE_LEVEL_LABELS[row.level] ?? `Уровень ${row.level}`}</LevelCell>
      <NumberCell>{formatCount(row.totalHeadcount)}</NumberCell>
      <NumberCell>{formatBudget(row.totalBudget)}</NumberCell>
      <NumberCell>
        <PerformanceValue>
          <PerformanceDot performance={row.averagePerformance} withValue={false} />
          {formatPerformance(row.averagePerformance)}
        </PerformanceValue>
      </NumberCell>
    </Row>
  )
}
