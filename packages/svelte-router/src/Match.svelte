<script lang="ts">
  import invariant from 'tiny-invariant'
  import {
    createControlledPromise,
    isNotFound,
    pick,
    rootRouteId,
  } from '@tanstack/router-core'
  import CatchBoundary from './CatchBoundary.svelte'
  import { useRouterState } from './useRouterState'
  import { useRouter } from './useRouter'
  import CatchNotFound from './CatchNotFound.svelte'
  import { setMatchContext } from './matchContext'
  import ScrollRestoration from './ScrollRestoration.svelte'
  import SafeFragment from './SafeFragment.svelte'
  import type { AnyRoute } from '@tanstack/router-core'
  import OnRendered from './OnRendered.svelte'
  import ErrorComponent from './ErrorComponent.svelte'
  import warning from 'tiny-warning'
  import MatchInner from './MatchInner.svelte'

  let props: { matchId: string } = $props()

  setMatchContext(props.matchId)

  const router = useRouter()
  const routeId = useRouterState({
    select: (s) => {
      return s.matches.find((d) => d.id === props.matchId)?.routeId as string
    },
  })

  invariant(
    routeId,
    `Could not find routeId for matchId "${props.matchId}". Please file an issue!`,
  )

  const route: AnyRoute = router.routesById[routeId]

  const PendingComponent =
    route.options.pendingComponent ?? router.options.defaultPendingComponent

  const routeErrorComponent =
    route.options.errorComponent ?? router.options.defaultErrorComponent

  const routeOnCatch = route.options.onCatch ?? router.options.defaultOnCatch

  const routeNotFoundComponent = route.isRoot
    ? // If it's the root route, use the globalNotFound option, with fallback to the notFoundRoute's component
      (route.options.notFoundComponent ??
      router.options.notFoundRoute?.options.component)
    : route.options.notFoundComponent

  const ResolvedCatchBoundary = routeErrorComponent
    ? CatchBoundary
    : SafeFragment

  const ResolvedNotFoundBoundary = routeNotFoundComponent
    ? CatchNotFound
    : SafeFragment

  const parentRouteId = useRouterState({
    select: (s) => {
      const index = s.matches.findIndex((d) => d.id === props.matchId)
      return s.matches[index - 1]?.routeId as string
    },
  })

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

  let pending = $state(false)

  if (matchState.match.status === 'pending') {
    pending = true
    const pendingMinMs =
      route.options.pendingMinMs ?? router.options.defaultPendingMinMs

    if (
      pendingMinMs &&
      !router.getMatch(matchState.match.id)?.minPendingPromise
    ) {
      // Create a promise that will resolve after the minPendingMs
      if (!router.isServer) {
        const minPendingPromise = createControlledPromise<void>()

        Promise.resolve().then(() => {
          router.updateMatch(matchState.match.id, (prev) => ({
            ...prev,
            minPendingPromise,
          }))
        })

        setTimeout(() => {
          minPendingPromise.resolve()

          // We've handled the minPendingPromise, so we can delete it
          router.updateMatch(matchState.match.id, (prev) => ({
            ...prev,
            minPendingPromise: undefined,
          }))
        }, pendingMinMs)
      }
    }

    router.getMatch(matchState.match.id)?.loadPromise?.resolve() // Resolve?
    pending = false
  }
</script>

{#if pending}
  <PendingComponent />
{:else}
  <ResolvedCatchBoundary
    errorComponent={routeErrorComponent || ErrorComponent}
    onCatch={(error: Error) => {
      // Forward not found errors (we don't want to show the error component for these)
      if (isNotFound(error)) throw error
      warning(false, `Error in route match: ${props.matchId}`)
      routeOnCatch?.(error)
    }}
  >
    <ResolvedNotFoundBoundary>
      {#snippet fallback({ error })}
        {@render routeNotFoundComponent?.(error)}
      {/snippet}
      <MatchInner matchId={props.matchId} />
    </ResolvedNotFoundBoundary>
  </ResolvedCatchBoundary>

  {#if parentRouteId === rootRouteId}
    <OnRendered />
    <ScrollRestoration />
  {/if}
{/if}
