import { QueryClientProvider } from '@tanstack/react-query'
import type { FC, PropsWithChildren } from 'react'
import { ThemeProvider } from 'styled-components'

import { queryClient } from '@/shared/lib'
import { GlobalStyle, theme } from '@/shared/styles'

export const AppProviders: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  </QueryClientProvider>
)
