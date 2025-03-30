import { getContext, setContext } from 'svelte'
import type { AnyRouter } from '@tanstack/router-core'

const routerContextKey = Symbol()

export function getRouterContext(): AnyRouter {
  return getContext(routerContextKey)
}

export function setRouterContext(value: AnyRouter) {
  setContext(routerContextKey, value)
}
