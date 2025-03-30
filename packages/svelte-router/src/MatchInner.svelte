<script lang="ts">
  import { AnyRoute, pick } from '@tanstack/router-core'
  import { useRouter } from './useRouter'
  import { useRouterState } from './useRouterState'
  import Outlet from './Outlet.svelte'

  let props: { matchId: string } = $props()

  const router = useRouter()

  const matchState: any = useRouterState({
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

  const route = () => router.routesById[matchState().routeId]!

  const match = () => matchState().match

  const out = () => {
    const Comp = route().options.component ?? router.options.defaultComponent
    if (Comp) {
      return Comp
    }
    return Outlet
  }
</script>

<!-- <Solid.Switch>
      <Solid.Match when={match().status === 'notFound'}>
        {(_) => {
          invariant(isNotFound(match().error), 'Expected a notFound error')

          return renderRouteNotFound(router, route(), match().error)
        }}
      </Solid.Match>
      <Solid.Match when={match().status === 'redirected'}>
        {(_) => {
          invariant(isRedirect(match().error), 'Expected a redirect error')

          const [loaderResult] = Solid.createResource(async () => {
            await new Promise((r) => setTimeout(r, 0))
            return router.getMatch(match().id)?.loadPromise
          })

          return <>{loaderResult()}</>
        }}
      </Solid.Match>
      <Solid.Match when={match().status === 'error'}>
        {(_) => {
          if (router.isServer) {
            const RouteErrorComponent =
              (route().options.errorComponent ??
                router.options.defaultErrorComponent) ||
              ErrorComponent

            return (
              <RouteErrorComponent
                error={match().error}
                info={{
                  componentStack: '',
                }}
              />
            )
          }

          throw match().error
        }}
      </Solid.Match>
      <Solid.Match when={match().status === 'pending'}>
        {(_) => {
          const pendingMinMs =
            route().options.pendingMinMs ?? router.options.defaultPendingMinMs

          if (pendingMinMs && !router.getMatch(match().id)?.minPendingPromise) {
            // Create a promise that will resolve after the minPendingMs
            if (!router.isServer) {
              const minPendingPromise = createControlledPromise<void>()

              Promise.resolve().then(() => {
                router.updateMatch(match().id, (prev) => ({
                  ...prev,
                  minPendingPromise,
                }))
              })

              setTimeout(() => {
                minPendingPromise.resolve()

                // We've handled the minPendingPromise, so we can delete it
                router.updateMatch(match().id, (prev) => ({
                  ...prev,
                  minPendingPromise: undefined,
                }))
              }, pendingMinMs)
            }
          }

          const [loaderResult] = Solid.createResource(async () => {
            await new Promise((r) => setTimeout(r, 0))
            return router.getMatch(match().id)?.loadPromise
          })

          return <>{loaderResult()}</>
        }}
      </Solid.Match>
      <Solid.Match when={match().status === 'success'}>{out()}</Solid.Match>
    </Solid.Switch> -->
