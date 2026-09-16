export type OrgSearchCandidate = {
  name: string
  level: number
  totalHeadcount: number
  totalBudget: number
  averagePerformance: number
}

export type OrgSearchResolution = 'llm' | 'local' | 'text'
