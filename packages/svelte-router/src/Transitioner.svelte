<script lang="ts">
  import { getLocationChangeInfo, trimPathRight } from '@tanstack/router-core'
  import { useRouter } from './useRouter'
  import { useRouterState } from './useRouterState.svelte'
  import { usePrevious } from './utils.svelte'
  import { onMount, untrack } from 'svelte'

  const router = useRouter()
  let mountLoadForRouter = { router, mounted: false }
  const isLoading = useRouterState({
    select: ({ isLoading }) => isLoading,
  })

  let isTransitioning = $state(false)
  // Track pending state changes
  const hasPendingMatches = useRouterState({
    select: (s) => s.matches.some((d) => d.status === 'pending'),
  })

  const previousIsLoading = usePrevious(() => isLoading.current)

  let isAnyPending = () => {
    return isLoading.current || isTransitioning || hasPendingMatches.current
  }
  let previousIsAnyPending = $derived(!isAnyPending())

  const isPagePending = $derived(isLoading.current || hasPendingMatches.current)
  const previousIsPagePending = usePrevious(() => isPagePending)

  if (!router.isServer) {
    router.startTransition = (fn: () => void) => {
      isTransitioning = true
      fn()
      isTransitioning = false
    }
  }

  // Subscribe to location changes
  // and try to load the new location
  onMount(() => {
    const unsub = router.history.subscribe(router.load)

    const nextLocation = router.buildLocation({
      to: router.latestLocation.pathname,
      search: true,
      params: true,
      hash: true,
      state: true,
      _includeValidateSearch: true,
    })

    if (
      trimPathRight(router.latestLocation.href) !==
      trimPathRight(nextLocation.href)
    ) {
      router.commitLocation({ ...nextLocation, replace: true })
    }

    return () => {
      unsub()
    }
  })

  // Try to load the initial location
  $effect.pre(() => {
    untrack(() => {
      if (
        (typeof window !== 'undefined' && router.clientSsr) ||
        (mountLoadForRouter.router === router && mountLoadForRouter.mounted)
      ) {
        return
      }
      mountLoadForRouter = { router, mounted: true }
      const tryLoad = async () => {
        try {
          await router.load()
        } catch (err) {
          console.error(err)
        }
      }
      tryLoad()
    })
  })

  $effect.pre(() => {
    if (previousIsLoading.previous && !isLoading.current) {
      untrack(() => {
        router.emit({
          type: 'onLoad',
          ...getLocationChangeInfo(router.state),
        })
      })
    }
  })
  $effect.pre(() => {
    // emit onBeforeRouteMount
    if (previousIsPagePending.previous && !isPagePending) {
      untrack(() => {
        router.emit({
          type: 'onBeforeRouteMount',
          ...getLocationChangeInfo(router.state),
        })
      })
    }
  })

  $effect.pre(() => {
    // The router was pending and now it's not
    if (previousIsAnyPending && !isAnyPending()) {
      untrack(() => {
        router.emit({
          type: 'onResolved',
          ...getLocationChangeInfo(router.state),
        })

        router.__store.setState((s) => {
          return {
            ...s,
            status: 'idle',
            resolvedLocation: s.location,
          }
        })

        if (
          typeof document !== 'undefined' &&
          (document as any).querySelector
        ) {
          const hashScrollIntoViewOptions =
            router.state.location.state.__hashScrollIntoViewOptions ?? true

          if (hashScrollIntoViewOptions && router.state.location.hash !== '') {
            const el = document.getElementById(router.state.location.hash)
            if (el) {
              el.scrollIntoView(hashScrollIntoViewOptions)
            }
          }
        }
      })
    }
  })
</script>
