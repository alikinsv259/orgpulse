import type { FC, ReactNode } from 'react'
import styled, { css, keyframes } from 'styled-components'

const HIGHLIGHT_DURATION_MS = 1500

const highlightFade = keyframes`
  from {
    background-color: rgba(76, 141, 255, 0.35);
  }
  to {
    background-color: transparent;
  }
`

const Highlight = styled.span<{ $isEnabled: boolean }>`
  display: inline-block;
  padding: 0 ${({ theme }) => theme.space(1)};
  margin: 0 calc(-1 * ${({ theme }) => theme.space(1)});
  border-radius: ${({ theme }) => theme.radius.sm};

  ${({ $isEnabled }) =>
    $isEnabled &&
    css`
      animation: ${highlightFade} ${HIGHLIGHT_DURATION_MS}ms ease-out;
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

type Props = {
  value: string | number
  isEnabled: boolean
  children: ReactNode
}

export const HighlightOnChange: FC<Props> = ({ value, isEnabled, children }) => (
  <Highlight key={String(value)} $isEnabled={isEnabled}>
    {children}
  </Highlight>
)
