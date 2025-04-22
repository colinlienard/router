<script lang="ts">
  import invariant from 'tiny-invariant'
  import { getMatchContext } from './matchContext'
  import { useRouter } from './useRouter'
  import { useRouterState } from './useRouterState'
  import { rootRouteId } from '@tanstack/router-core'
  import Match from './Match.svelte'
  import RouteNotFound from './RouteNotFound.svelte'
  import Suspense from './Suspense.svelte'

  const router = useRouter()
  const matchId = getMatchContext()
  const routeId = useRouterState({
    select: (s) => s.matches.find((d) => d.id === matchId)?.routeId as string,
  })

  const route = () => router.routesById[routeId]!

  const parentGlobalNotFound = useRouterState({
    select: (s) => {
      const matches = s.matches
      const parentMatch = matches.find((d) => d.id === matchId)
      invariant(
        parentMatch,
        `Could not find parent match for matchId "${matchId}"`,
      )
      return parentMatch.globalNotFound
    },
  })

  const childMatchId = useRouterState({
    select: (s) => {
      const matches = s.matches
      const index = matches.findIndex((d) => d.id === matchId)
      const v = matches[index + 1]?.id
      return v
    },
  })
</script>

{#if parentGlobalNotFound}
  <RouteNotFound {router} route={route()} data={undefined} />
{:else if childMatchId}
  {#if matchId === rootRouteId}
    <Suspense fallback={router.options.defaultPendingComponent}>
      <Match matchId={childMatchId} />
    </Suspense>
  {:else}
    <Match matchId={childMatchId} />
  {/if}
{/if}
