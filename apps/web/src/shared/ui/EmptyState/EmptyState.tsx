import type { FC } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  padding: ${({ theme }) => theme.space(10)};
  text-align: center;
`

const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.md};
`

const Description = styled.p`
  margin: 0;
  max-width: 420px;
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
`

type Props = {
  title: string
  description?: string
}

export const EmptyState: FC<Props> = ({ title, description }) => (
  <Wrapper>
    <Title>{title}</Title>
    {description ? <Description>{description}</Description> : null}
  </Wrapper>
)
