export const orgNodeQueryKeys = {
  root: ['orgNodes'] as const,
  tree: () => ['orgNodes', 'tree'] as const,
}
