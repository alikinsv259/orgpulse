import { type FC, useEffect, useRef } from 'react'
import styled from 'styled-components'

import { ORG_NODE_LEVEL_LABELS, type OrgTreeNode as OrgTreeNodeType, PerformanceDot } from '@/entities/orgNode'
import { formatCount } from '@/shared/lib'
import { HighlightOnChange } from '@/shared/ui'

const Item = styled.li`
  list-style: none;
`

const Row = styled.div<{ $level: number; $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  padding-left: ${({ theme, $level }) => `calc(${theme.space(2)} + ${$level - 1} * ${theme.space(5)})`};
  padding-right: ${({ theme }) => theme.space(3)};
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme, $isSelected }) => ($isSelected ? theme.color.accentSoft : 'transparent')};
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme, $isSelected }) => ($isSelected ? theme.color.accentSoft : theme.color.surfaceHover)};
  }
`

const ToggleButton = styled.button<{ $isExpanded: boolean; $isHidden: boolean }>`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.color.textMuted};
  font-size: 9px;
  cursor: pointer;
  visibility: ${({ $isHidden }) => ($isHidden ? 'hidden' : 'visible')};
  transform: rotate(${({ $isExpanded }) => ($isExpanded ? '90deg' : '0deg')});
  transition: transform ${({ theme }) => theme.transition.medium};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const SelectButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(3)};
  flex: 1 1 auto;
  min-width: 0;
  padding: ${({ theme }) => `${theme.space(2)} 0`};
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
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
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-variant-numeric: tabular-nums;
`

const Collapse = styled.div<{ $isExpanded: boolean }>`
  display: grid;
  grid-template-rows: ${({ $isExpanded }) => ($isExpanded ? '1fr' : '0fr')};
  transition: grid-template-rows ${({ theme }) => theme.transition.medium};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const CollapseInner = styled.div`
  min-height: 0;
  overflow: hidden;
`

const Group = styled.ul`
  margin: 0;
  padding: 0;
`

type Props = {
  node: OrgTreeNodeType
  expandedIds: Set<string>
  selectedId: string | null
  liveUpdatedIds: Set<string>
  onToggle: (id: string) => void
  onSelect: (id: string) => void
}

export const OrgTreeNode: FC<Props> = ({
  node,
  expandedIds,
  selectedId,
  liveUpdatedIds,
  onToggle,
  onSelect,
}) => {
  const hasChildren = node.children.length > 0
  const isExpanded = hasChildren && expandedIds.has(node.id)
  const isSelected = node.id === selectedId
  const isLive = liveUpdatedIds.has(node.id)

  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isSelected) rowRef.current?.scrollIntoView({ block: 'nearest' })
  }, [isSelected])

  return (
    <Item role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isSelected}>
      <Row ref={rowRef} $level={node.level} $isSelected={isSelected}>
        <ToggleButton
          type="button"
          $isExpanded={isExpanded}
          $isHidden={!hasChildren}
          tabIndex={hasChildren ? 0 : -1}
          aria-label={isExpanded ? `Свернуть ${node.name}` : `Развернуть ${node.name}`}
          onClick={() => onToggle(node.id)}
        >
          ▶
        </ToggleButton>

        <SelectButton type="button" onClick={() => onSelect(node.id)}>
          <Name>{node.name}</Name>
          <LevelLabel>{ORG_NODE_LEVEL_LABELS[node.level] ?? `Уровень ${node.level}`}</LevelLabel>
          <Headcount>
            <HighlightOnChange value={node.headcount} isEnabled={isLive}>
              {formatCount(node.headcount)}
            </HighlightOnChange>
          </Headcount>
          <HighlightOnChange value={node.performance} isEnabled={isLive}>
            <PerformanceDot performance={node.performance} />
          </HighlightOnChange>
        </SelectButton>
      </Row>

      {hasChildren ? (
        <Collapse $isExpanded={isExpanded} inert={!isExpanded}>
          <CollapseInner>
            <Group role="group">
              {node.children.map((child) => (
                <OrgTreeNode
                  key={child.id}
                  node={child}
                  expandedIds={expandedIds}
                  selectedId={selectedId}
                  liveUpdatedIds={liveUpdatedIds}
                  onToggle={onToggle}
                  onSelect={onSelect}
                />
              ))}
            </Group>
          </CollapseInner>
        </Collapse>
      ) : null}
    </Item>
  )
}
