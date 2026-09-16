import type { FC } from 'react'
import styled from 'styled-components'

import type { OrgTreeNode as OrgTreeNodeType } from '@/entities/orgNode'
import { useTreeExpansion } from '@/widgets/orgTree/hooks'
import { OrgTreeNode } from '@/widgets/orgTree/ui/OrgTreeNode'

const Root = styled.ul`
  margin: 0;
  padding: 0;
`

type Props = {
  tree: OrgTreeNodeType[]
}

export const OrgTree: FC<Props> = ({ tree }) => {
  const { expandedIds, toggleNode } = useTreeExpansion(tree)

  return (
    <Root role="tree" aria-label="Орг-структура компании">
      {tree.map((node) => (
        <OrgTreeNode key={node.id} node={node} expandedIds={expandedIds} onToggle={toggleNode} />
      ))}
    </Root>
  )
}
