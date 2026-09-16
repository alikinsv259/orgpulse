import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    height: 100%;
  }

  body {
    margin: 0;
    background: ${({ theme }) => theme.color.background};
    color: ${({ theme }) => theme.color.text};
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    font-size: ${({ theme }) => theme.fontSize.md};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  button {
    font: inherit;
    color: inherit;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.accent};
    outline-offset: 2px;
  }
`
