import type { FC } from 'react'
import styled from 'styled-components'

import { ORG_NODE_LEVEL_LABELS, type OrgTreeNode as OrgTreeNodeType, PerformanceDot } from '@/entities/orgNode'
import { formatCount } from '@/shared/lib'

const Item = styled.li`
  list-style: none;
`

const Row = styled.button<{ $level: number }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(3)};
  width: 100%;
  padding: ${({ theme, $level }) =>
    `${theme.space(2)} ${theme.space(4)} ${theme.space(2)} calc(${theme.space(3)} + ${$level - 1} * ${theme.space(5)})`};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.color.surfaceHover};
  }
`

const Chevron = styled.span<{ $isExpanded: boolean; $isHidden: boolean }>`
  flex: 0 0 auto;
  width: 14px;
  color: ${({ theme }) => theme.color.textMuted};
  visibility: ${({ $isHidden }) => ($isHidden ? 'hidden' : 'visible')};
  transform: rotate(${({ $isExpanded }) => ($isExpanded ? '90deg' : '0deg')});
  transition: transform ${({ theme }) => theme.transition.fast};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const Name = styled.span`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.fontSize.sm};
`

const LevelLabel = styled.span`
  flex: 0 0 auto;
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.xs};
`

const Headcount = styled.span`
  flex: 0 0 auto;
  padding: ${({ theme }) => `${theme.space(0.5)} ${theme.space(2)}`};
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.color.accentSoft};
  color: ${({ theme }) => theme.color.text};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-variant-numeric: tabular-nums;
`

const Group = styled.ul`
  margin: 0;
  padding: 0;
`

type Props = {
  node: OrgTreeNodeType
  expandedIds: Set<string>
  onToggle: (id: string) => void
}

export const OrgTreeNode: FC<Props> = ({ node, expandedIds, onToggle }) => {
  const hasChildren = node.children.length > 0
  const isExpanded = hasChildren && expandedIds.has(node.id)

  return (
    <Item role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
      <Row
        type="button"
        $level={node.level}
        onClick={hasChildren ? () => onToggle(node.id) : undefined}
      >
        <Chevron $isExpanded={isExpanded} $isHidden={!hasChildren} aria-hidden="true">
          ▶
        </Chevron>
        <Name>{node.name}</Name>
        <LevelLabel>{ORG_NODE_LEVEL_LABELS[node.level] ?? `Уровень ${node.level}`}</LevelLabel>
        <Headcount>{formatCount(node.headcount)}</Headcount>
        <PerformanceDot performance={node.performance} />
      </Row>

      {isExpanded ? (
        <Group role="group">
          {node.children.map((child) => (
            <OrgTreeNode key={child.id} node={child} expandedIds={expandedIds} onToggle={onToggle} />
          ))}
        </Group>
      ) : null}
    </Item>
  )
}
