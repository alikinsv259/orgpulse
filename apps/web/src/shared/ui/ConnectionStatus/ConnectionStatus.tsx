import type { FC } from 'react'
import styled, { css, keyframes } from 'styled-components'

import type { LiveStatus } from '@/shared/api'
import type { ThemeTone } from '@/shared/styles'

const STATUS_LABELS: Record<LiveStatus, string> = {
  idle: 'Не подключено',
  connecting: 'Подключение…',
  open: 'Live',
  reconnecting: 'Переподключение…',
}

const STATUS_TONES: Record<LiveStatus, ThemeTone> = {
  idle: 'bad',
  connecting: 'warn',
  open: 'good',
  reconnecting: 'warn',
}

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`

const Wrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  padding: ${({ theme }) => `${theme.space(1)} ${theme.space(3)}`};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.xs};
`

const Dot = styled.span<{ $tone: ThemeTone; $isPulsing: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme, $tone }) => theme.color[$tone]};

  ${({ $isPulsing }) =>
    $isPulsing &&
    css`
      animation: ${pulse} 1.2s ease-in-out infinite;
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

type Props = {
  status: LiveStatus
}

export const ConnectionStatus: FC<Props> = ({ status }) => (
  <Wrapper role="status" aria-live="polite">
    <Dot
      $tone={STATUS_TONES[status]}
      $isPulsing={status === 'connecting' || status === 'reconnecting'}
      aria-hidden="true"
    />
    {STATUS_LABELS[status]}
  </Wrapper>
)
