import type { FC } from 'react'

import { AppProviders } from '@/app/providers'
import { DashboardPage } from '@/views/dashboard'

export const App: FC = () => (
  <AppProviders>
    <DashboardPage />
  </AppProviders>
)
