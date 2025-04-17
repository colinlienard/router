<script lang="ts">
  import {
    defaultGetScrollRestorationKey,
    restoreScroll,
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
