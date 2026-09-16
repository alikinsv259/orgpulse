import styled from 'styled-components'

export const Card = styled.section`
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.color.surface};
  overflow: hidden;
`
