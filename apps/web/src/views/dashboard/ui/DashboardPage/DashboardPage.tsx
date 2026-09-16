import type { FC } from 'react'
import styled from 'styled-components'

import { getOrgTreeErrorMessage, useOrgTreeQuery } from '@/entities/orgNode'
import { formatCount } from '@/shared/lib'
import { Button, Card, EmptyState, ErrorState, Spinner } from '@/shared/ui'
import { OrgTree } from '@/widgets/orgTree'

const Page = styled.main`
  max-width: 960px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.space(10)} ${theme.space(5)}`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(6)};
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

export const DashboardPage: FC = () => {
  const { data, tree, isPending, isError, error, isFetching, refetch } = useOrgTreeQuery()

  const renderContent = () => {
    if (isPending) return <Spinner label="Загружаем орг-структуру…" />

    if (isError) {
      return (
        <ErrorState
          description={getOrgTreeErrorMessage(error)}
          isRetrying={isFetching}
          onRetry={() => void refetch()}
        />
      )
    }

    if (tree.length === 0) {
      return <EmptyState title="Орг-структура пуста" description="Сервер не вернул ни одного подразделения." />
    }

    return <OrgTree tree={tree} />
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

      <Card>{renderContent()}</Card>
    </Page>
  )
}
