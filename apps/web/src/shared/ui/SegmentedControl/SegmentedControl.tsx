import styled from 'styled-components'

const Group = styled.div`
  display: inline-flex;
  padding: ${({ theme }) => theme.space(0.5)};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.color.surface};
`

const Segment = styled.button<{ $isActive: boolean }>`
  padding: ${({ theme }) => `${theme.space(1.5)} ${theme.space(4)}`};
  border: none;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme, $isActive }) => ($isActive ? theme.color.accentSoft : 'transparent')};
  color: ${({ theme, $isActive }) => ($isActive ? theme.color.text : theme.color.textMuted)};
  font-size: ${({ theme }) => theme.fontSize.sm};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.color.text};
  }
`

type Option<T extends string> = {
  value: T
  label: string
}

type Props<T extends string> = {
  value: T
  options: Option<T>[]
  ariaLabel: string
  onChange: (value: T) => void
}

export const SegmentedControl = <T extends string>({ value, options, ariaLabel, onChange }: Props<T>) => (
  <Group role="tablist" aria-label={ariaLabel}>
    {options.map((option) => (
      <Segment
        key={option.value}
        type="button"
        role="tab"
        aria-selected={option.value === value}
        $isActive={option.value === value}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </Segment>
    ))}
  </Group>
)
