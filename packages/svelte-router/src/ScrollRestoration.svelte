<script lang="ts" module>
  export function useScrollRestoration() {
    const router = useRouter()
    setupScrollRestoration(router, true)
  }

  export function useElementScrollRestoration(
    options: (
      | {
          id: string
          getElement?: () => Window | Element | undefined | null
        }
      | {
          id?: string
          getElement: () => Window | Element | undefined | null
        }
    ) & {
      getKey?: (location: ParsedLocation) => string
    },
  ): ScrollRestorationEntry | undefined {
    useScrollRestoration()

    const router = useRouter()
    const getKey = options.getKey || defaultGetScrollRestorationKey

    let elementSelector = ''

    if (options.id) {
      elementSelector = `[data-scroll-restoration-id="${options.id}"]`
    } else {
      const element = options.getElement?.()
      if (!element) {
        return
      }
      elementSelector =
        element instanceof Window ? 'window' : getCssSelector(element)
    }

    const restoreKey = getKey(router.latestLocation)
    const byKey = scrollRestorationCache.state[restoreKey]
    return byKey?.[elementSelector]
  }
</script>

<script lang="ts">
  import {
    defaultGetScrollRestorationKey,
    getCssSelector,
    ParsedLocation,
    restoreScroll,
    scrollRestorationCache,
    ScrollRestorationEntry,
    setupScrollRestoration,
    storageKey,
  } from '@tanstack/router-core'
  import { useRouter } from './useRouter'
  import ScriptOnce from './ScriptOnce.svelte'

  const router = useRouter()
  const getKey =
    router.options.getScrollRestorationKey || defaultGetScrollRestorationKey
  const userKey = getKey(router.latestLocation)
  const resolvedKey =
    userKey !== defaultGetScrollRestorationKey(router.latestLocation)
      ? userKey
      : null
</script>

{#if router.isScrollRestoring && router.isServer}
  <ScriptOnce
    children={`(${restoreScroll.toString()})(${JSON.stringify(storageKey)},${JSON.stringify(resolvedKey)}, undefined, true)`}
    log={false}
  />
{/if}
