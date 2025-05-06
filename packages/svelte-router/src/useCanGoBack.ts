import { useRouterState } from './useRouterState.svelte.js'

export function useCanGoBack() {
  return useRouterState({ select: (s) => s.location.state.__TSR_index !== 0 })
}
