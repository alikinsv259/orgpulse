import type { FC } from 'react'
import styled from 'styled-components'

import { Button } from '@/shared/ui/Button'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.space(3)};
  padding: ${({ theme }) => theme.space(10)};
  text-align: center;
`

const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.color.bad};
`

const Description = styled.p`
  margin: 0;
  max-width: 420px;
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
`

type Props = {
  title?: string
  description: string
  isRetrying?: boolean
  onRetry?: () => void
}

export const ErrorState: FC<Props> = ({ title = 'Что-то пошло не так', description, isRetrying, onRetry }) => (
  <Wrapper role="alert">
    <Title>{title}</Title>
    <Description>{description}</Description>
    {onRetry ? (
      <Button type="button" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? 'Повторяем…' : 'Повторить'}
      </Button>
    ) : null}
  </Wrapper>
)
