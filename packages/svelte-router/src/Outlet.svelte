<script lang="ts">
  import invariant from 'tiny-invariant'
  import { getMatchContext } from './matchContext'
  import { useRouter } from './useRouter'
  import { useRouterState } from './useRouterState'
  import { renderRouteNotFound } from './renderRouteNotFound'
  import { rootRouteId } from '@tanstack/router-core'
  import Match from './Match.svelte'

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
  {renderRouteNotFound(router, route(), undefined)}
{:else if childMatchId}
  {#if matchId === rootRouteId}
    <!-- TODO -->
    {@render router.options.defaultPendingComponent?.(undefined)}
    <Match {matchId} />
  {:else}
    <Match {matchId} />
  {/if}
{/if}

<!-- <Solid.Switch>
      <Solid.Match when={parentGlobalNotFound()}>
        {renderRouteNotFound(router, route(), undefined)}
      </Solid.Match>
      <Solid.Match when={childMatchId()}>
        {(matchId) => {
          // const nextMatch = <Match matchId={matchId()} />

          return (
            <Solid.Show
              when={matchId() === rootRouteId}
              fallback={<Match matchId={matchId()} />}
            >
              <Solid.Suspense
                fallback={
                  <Dynamic component={router.options.defaultPendingComponent} />
                }
              >
                <Match matchId={matchId()} />
              </Solid.Suspense>
            </Solid.Show>
          )
        }}
      </Solid.Match>
    </Solid.Switch> -->
