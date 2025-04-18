<script lang="ts">
  import { AnyRoute, isRedirect, pick } from '@tanstack/router-core'
  import { useRouter } from './useRouter'
  import { useRouterState } from './useRouterState'
  import Outlet from './Outlet.svelte'
  import RouteNotFound from './RouteNotFound.svelte'
  import ErrorComponent from './ErrorComponent.svelte'
  import invariant from 'tiny-invariant'

  let props: { matchId: string } = $props()

  const router = useRouter()

  const matchState = useRouterState({
    select: (s) => {
      const matchIndex = s.matches.findIndex((d) => d.id === props.matchId)
      const match = s.matches[matchIndex]!
      const routeId = match.routeId as string

      const remountFn =
        (router.routesById[routeId] as AnyRoute).options.remountDeps ??
        router.options.defaultRemountDeps
      const remountDeps = remountFn?.({
        routeId,
        loaderDeps: match.loaderDeps,
        params: match._strictParams,
        search: match._strictSearch,
      })
      const key = remountDeps ? JSON.stringify(remountDeps) : undefined

      return {
        key,
        routeId,
        match: pick(match, ['id', 'status', 'error']),
      }
    },
  })

  const route = router.routesById[matchState.routeId]!

  const match = matchState.match
  console.log('match inner', route)

  if (match.status === 'redirected') {
    invariant(isRedirect(match.error), 'Expected a redirect error')
    router.getMatch(match.id)?.loadPromise?.resolve() // Resolve?
  }
</script>

{#if match.status === 'notFound'}
  <RouteNotFound {router} {route} data={match.error} />
{:else if match.status === 'error'}
  {#if router.isServer}
    {#if route.options.errorComponent}
      {@render route.options.errorComponent({
        error: match.error,
        info: { componentStack: '' },
      })}
    {:else if router.options.defaultErrorComponent}
      {@render router.options.defaultErrorComponent({
        error: match.error as Error,
        info: { componentStack: '' },
        reset: () => null,
      })}
    {:else}
      <ErrorComponent error={match.error} />
    {/if}
  {:else}
    {(() => {
      throw match.error
    })()}
  {/if}
{:else if match.status === 'success'}
  {#if route.options.component}
    {@render route.options.component()}
  {:else if router.options.defaultComponent}
    {@render router.options.defaultComponent(undefined)}
  {:else}
    <Outlet />
  {/if}
{/if}
