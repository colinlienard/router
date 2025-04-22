<script lang="ts">
  import invariant from 'tiny-invariant'
  import { isNotFound, rootRouteId } from '@tanstack/router-core'
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
  import Suspense from './Suspense.svelte'

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

  const ResolvedSuspenseBoundary =
    // If we're on the root route, allow forcefully wrapping in suspense
    (!route.isRoot || route.options.wrapInSuspense) &&
    (route.options.wrapInSuspense ??
      PendingComponent ??
      (route.options.errorComponent as any)?.preload)
      ? Suspense
      : SafeFragment

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
</script>

<ResolvedSuspenseBoundary fallback={PendingComponent}>
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
</ResolvedSuspenseBoundary>
