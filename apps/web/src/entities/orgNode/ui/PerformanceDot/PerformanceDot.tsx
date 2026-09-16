import type { FC } from 'react'
import styled from 'styled-components'

import { getPerformanceTone } from '@/entities/orgNode/lib/getPerformanceTone'
import type { PerformanceTone } from '@/entities/orgNode/model/types'

const Wrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(1.5)};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.textMuted};
  font-variant-numeric: tabular-nums;
`

const Dot = styled.span<{ $tone: PerformanceTone }>`
  width: 8px;
  height: 8px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme, $tone }) => theme.color[$tone]};
`

type Props = {
  performance: number
  withValue?: boolean
}

export const PerformanceDot: FC<Props> = ({ performance, withValue = true }) => {
  const tone = getPerformanceTone(performance)

  return (
    <Wrapper title={`Эффективность: ${performance}`}>
      <Dot $tone={tone} aria-hidden="true" />
      {withValue ? performance : null}
    </Wrapper>
  )
}
