import type { OrgSearchConfidence } from '@staff-pulse/api-contract'
import type { FC } from 'react'
import styled from 'styled-components'

import type { OrgSearchResolution } from '@/features/orgSearch/model'
import { TextField } from '@/shared/ui'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(2)};
  flex: 1 1 auto;
  min-width: 0;
`

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  min-width: 0;
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.xs};
`

const Chip = styled.span<{ $isAccent: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(1.5)};
  flex: 0 0 auto;
  padding: ${({ theme }) => `${theme.space(0.5)} ${theme.space(2)}`};
  border: 1px solid ${({ theme, $isAccent }) => ($isAccent ? 'transparent' : theme.color.border)};
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme, $isAccent }) => ($isAccent ? theme.color.accentSoft : 'transparent')};
  color: ${({ theme, $isAccent }) => ($isAccent ? theme.color.text : theme.color.textMuted)};
`

const ChipDot = styled.span<{ $isAccent: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme, $isAccent }) => ($isAccent ? theme.color.good : theme.color.textMuted)};
`

const RESOLUTION_LABELS: Record<OrgSearchResolution, string> = {
  llm: 'разобрал ИИ',
  local: 'разобрал парсер',
  text: 'поиск по названию',
}

const Hint = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Warning = styled.p`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.space(2)};
  margin: 0;
  padding: ${({ theme }) => `${theme.space(2)} ${theme.space(3)}`};
  border: 1px solid ${({ theme }) => theme.color.warn};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.color.warn};
  font-size: ${({ theme }) => theme.fontSize.xs};
  line-height: 1.4;
`

type Props = {
  query: string
  resolution: OrgSearchResolution | null
  confidence: OrgSearchConfidence | null
  summary: string | null
  warning: string | null
  isInterpreting: boolean
  isLlmAvailable: boolean
  requiredEnvVar: string
  model: string | null
  onQueryChange: (query: string) => void
}

export const OrgSearchField: FC<Props> = ({
  query,
  resolution,
  confidence,
  summary,
  warning,
  isInterpreting,
  isLlmAvailable,
  requiredEnvVar,
  model,
  onQueryChange,
}) => {
  const badgeLabel = isLlmAvailable ? `ИИ-поиск${model ? ` · ${model}` : ''}` : 'ИИ-поиск выключен'

  const hint = (() => {
    if (isInterpreting) return 'Разбираем запрос…'
    if (summary) return confidence === 'guess' ? `Предположение: ${summary}` : summary
    if (!isLlmAvailable) {
      return `Работает поиск по названию. Добавьте ${requiredEnvVar} в .env, чтобы включить разбор запроса моделью`
    }

    return 'Например: команды с эффективностью ниже 60'
  })()

  return (
    <Wrapper>
      <TextField
        type="search"
        value={query}
        placeholder="Поиск на естественном языке или по названию"
        aria-label="Поиск подразделений"
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <Meta>
        <Chip $isAccent={isLlmAvailable}>
          <ChipDot $isAccent={isLlmAvailable} aria-hidden="true" />
          {badgeLabel}
        </Chip>

        {resolution && !isInterpreting ? (
          <Chip $isAccent={false}>{RESOLUTION_LABELS[resolution]}</Chip>
        ) : null}

        <Hint title={hint}>{hint}</Hint>
      </Meta>

      {warning ? (
        <Warning role="status">
          <span aria-hidden="true">⚠</span>
          {warning}
        </Warning>
      ) : null}
    </Wrapper>
  )
}
