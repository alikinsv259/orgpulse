import styled from 'styled-components'

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space(2)};
  padding: ${({ theme }) => `${theme.space(2)} ${theme.space(4)}`};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.color.surface};
  font-size: ${({ theme }) => theme.fontSize.sm};
  cursor: pointer;
  transition:
    background ${({ theme }) => theme.transition.fast},
    border-color ${({ theme }) => theme.transition.fast};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.color.surfaceHover};
    border-color: ${({ theme }) => theme.color.accent};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
