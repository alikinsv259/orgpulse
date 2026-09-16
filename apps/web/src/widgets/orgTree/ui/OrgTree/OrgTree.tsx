import type { FC } from 'react'
import styled from 'styled-components'

import type { OrgTreeNode as OrgTreeNodeType } from '@/entities/orgNode'
import { OrgTreeNode } from '@/widgets/orgTree/ui/OrgTreeNode'

const Root = styled.ul`
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin: 0;
  padding: 0;
`

type Props = {
  tree: OrgTreeNodeType[]
  expandedIds: Set<string>
  selectedId: string | null
  onToggle: (id: string) => void
  onSelect: (id: string) => void
}

export const OrgTree: FC<Props> = ({ tree, expandedIds, selectedId, onToggle, onSelect }) => (
  <Root role="tree" aria-label="Орг-структура компании">
    {tree.map((node) => (
      <OrgTreeNode
        key={node.id}
        node={node}
        expandedIds={expandedIds}
        selectedId={selectedId}
        onToggle={onToggle}
        onSelect={onSelect}
      />
    ))}
  </Root>
)
