import type { FC } from 'react'
import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

const Circle = styled.span`
  width: 20px;
  height: 20px;
  border: 2px solid ${({ theme }) => theme.color.border};
  border-top-color: ${({ theme }) => theme.color.accent};
  border-radius: ${({ theme }) => theme.radius.pill};
  animation: ${spin} 700ms linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 2s;
  }
`

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space(3)};
  padding: ${({ theme }) => theme.space(10)};
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
`

type Props = {
  label?: string
}

export const Spinner: FC<Props> = ({ label = 'Загрузка…' }) => (
  <Wrapper role="status" aria-live="polite">
    <Circle aria-hidden="true" />
    {label}
  </Wrapper>
)
