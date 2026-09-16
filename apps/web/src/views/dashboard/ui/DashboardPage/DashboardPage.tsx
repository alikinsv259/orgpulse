import { type FC, useState } from 'react'
import styled from 'styled-components'

import { getOrgTreeErrorMessage, useOrgTreeQuery } from '@/entities/orgNode'
import { formatCount, useMediaQuery } from '@/shared/lib'
import { Button, Card, EmptyState, ErrorState, SegmentedControl, Spinner } from '@/shared/ui'
import { DASHBOARD_VIEW_OPTIONS, type DashboardView, SPLIT_VIEW_MEDIA_QUERY } from '@/views/dashboard/model'
import { OrgTable } from '@/widgets/orgTable'
import { OrgTree, useTreeExpansion } from '@/widgets/orgTree'

const Page = styled.main`
  max-width: 1440px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.space(10)} ${theme.space(5)}`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(5)};
`

const Header = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(4)};
  flex-wrap: wrap;
`

const Title = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.xl};
  letter-spacing: -0.02em;
`

const Subtitle = styled.p`
  margin: ${({ theme }) => `${theme.space(1)} 0 0`};
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(3)};
`

const NodeCount = styled.span`
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-variant-numeric: tabular-nums;
`

const Split = styled.div`
  display: grid;
  grid-template-columns: minmax(360px, 460px) 1fr;
  gap: ${({ theme }) => theme.space(5)};
  align-items: start;
`

const Pane = styled(Card)`
  display: flex;
  flex-direction: column;
  max-height: min(680px, calc(100vh - 220px));
`

const PaneHeader = styled.h2`
  flex: 0 0 auto;
  margin: 0;
  padding: ${({ theme }) => `${theme.space(3)} ${theme.space(4)}`};
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const DashboardPage: FC = () => {
  const { data, tree, flatNodes, aggregates, isPending, isError, error, isFetching, refetch } = useOrgTreeQuery()

  const [view, setView] = useState<DashboardView>('tree')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const isSplitView = useMediaQuery(SPLIT_VIEW_MEDIA_QUERY)
  const { expandedIds, toggleNode, expandAncestors } = useTreeExpansion(tree)

  const handleSelect = (id: string) => {
    setSelectedId(id)
    expandAncestors(id)
  }

  const handleSelectFromTable = (id: string) => {
    handleSelect(id)

    if (!isSplitView) setView('tree')
  }

  const renderBody = () => {
    if (isPending) {
      return (
        <Card>
          <Spinner label="Загружаем орг-структуру…" />
        </Card>
      )
    }

    if (isError) {
      return (
        <Card>
          <ErrorState
            description={getOrgTreeErrorMessage(error)}
            isRetrying={isFetching}
            onRetry={() => void refetch()}
          />
        </Card>
      )
    }

    if (tree.length === 0) {
      return (
        <Card>
          <EmptyState title="Орг-структура пуста" description="Сервер не вернул ни одного подразделения." />
        </Card>
      )
    }

    const treePane = (
      <Pane>
        {isSplitView ? <PaneHeader>Дерево</PaneHeader> : null}
        <OrgTree
          tree={tree}
          expandedIds={expandedIds}
          selectedId={selectedId}
          onToggle={toggleNode}
          onSelect={handleSelect}
        />
      </Pane>
    )

    const tablePane = (
      <Pane>
        {isSplitView ? <PaneHeader>Таблица</PaneHeader> : null}
        <OrgTable
          nodes={flatNodes}
          aggregates={aggregates}
          selectedId={selectedId}
          onSelect={handleSelectFromTable}
        />
      </Pane>
    )

    if (isSplitView) {
      return (
        <Split>
          {treePane}
          {tablePane}
        </Split>
      )
    }

    return (
      <>
        <SegmentedControl
          value={view}
          options={DASHBOARD_VIEW_OPTIONS}
          ariaLabel="Режим просмотра"
          onChange={setView}
        />
        {view === 'tree' ? treePane : tablePane}
      </>
    )
  }

  return (
    <Page>
      <Header>
        <div>
          <Title>OrgPulse</Title>
          <Subtitle>Мониторинг орг-структуры компании</Subtitle>
        </div>

        <Toolbar>
          {data ? <NodeCount>{formatCount(data.length)} подразделений</NodeCount> : null}
          <Button type="button" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? 'Обновляем…' : 'Обновить'}
          </Button>
        </Toolbar>
      </Header>

      {renderBody()}
    </Page>
  )
}
