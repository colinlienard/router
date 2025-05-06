<script lang="ts">
  import { getMatchContext } from './matchContext'
  import { useRouter } from './useRouter'
  import { useRouterState } from './useRouterState.svelte.js'
  import { rootRouteId } from '@tanstack/router-core'
  import Match from './Match.svelte'
  import RouteNotFound from './RouteNotFound.svelte'

  const router = useRouter()
  const matchId = getMatchContext()
  const routeId = useRouterState({
    select: (s) => s.matches.find((d) => d.id === matchId)?.routeId as string,
  })

  const route = () => router.routesById[routeId.current]!

  const parentGlobalNotFound = useRouterState({
    select: (s) => {
      const matches = s.matches
      const parentMatch = matches.find((d) => d.id === matchId)
      return parentMatch?.globalNotFound
    },
  })

  let childMatchId = useRouterState({
    select: (s) => {
      const matches = s.matches
      const index = matches.findIndex((d) => d.id === matchId)
      const v = matches[index + 1]?.id
      return v
    },
  })
</script>

{#if parentGlobalNotFound.current}
  <RouteNotFound {router} route={route()} data={undefined} />
{:else if childMatchId.current}
  {#if matchId === rootRouteId}
    <!-- TODO -->
    <!-- {@render router.options.defaultPendingComponent?.(undefined)} -->
    {#key childMatchId.current}
      <Match matchId={childMatchId.current} />
    {/key}
  {:else}
    {#key childMatchId.current}
      <Match matchId={childMatchId.current} />
    {/key}
  {/if}
{/if}
