<script lang="ts">
  import { lazyShared } from './lazyRouteComponent.svelte'
  import Outlet from './Outlet.svelte'
  import { useSuspense } from './Suspense.svelte'

  let props = $props()

  // If the load fails due to module not found, it may mean a new version of
  // the build was deployed and the user's browser is still using an old version.
  // If this happens, the old version in the user's browser would have an outdated
  // URL to the lazy module.
  // In that case, we want to attempt one window refresh to get the latest.
  function isModuleNotFoundError(error: any): boolean {
    return (
      typeof error?.message === 'string' &&
      /Failed to fetch dynamically imported module/.test(error.message)
    )
  }

  // Now that we're out of preload and into actual render path,
  // throw the error if it was a module not found error during preload
  if (lazyShared.error) {
    if (isModuleNotFoundError(lazyShared.error)) {
      // We don't want an error thrown from preload in this case, because
      // there's nothing we want to do about module not found during preload.
      // Record the error, recover the promise with a null return,
      // and we will attempt module not found resolution during the render path.

      if (
        lazyShared.error instanceof Error &&
        typeof window !== 'undefined' &&
        typeof sessionStorage !== 'undefined'
      ) {
        // Again, we want to reload one time on module not found error and not enter
        // a reload loop if there is some other issue besides an old deploy.
        // That's why we store our reload attempt in sessionStorage.
        // Use error.message as key because it contains the module path that failed.
        const storageKey = `tanstack_router_reload:${lazyShared.error.message}`
        if (!sessionStorage.getItem(storageKey)) {
          sessionStorage.setItem(storageKey, '1')
          window.location.reload()
        }
      }
    }

    // Otherwise, just throw the error
    throw lazyShared.error
  }

  const isServer = typeof window === 'undefined'

  let comp = useSuspense(
    !lazyShared.comp
      ? () => lazyShared.load
      : () => Promise.resolve(lazyShared.comp),
  )
</script>

{#if comp}
  {@render comp()}
{:else if lazyShared.ssr === false}
  {#if isServer}
    {@render lazyShared.comp.value?.(props)}
  {:else}
    <Outlet />
  {/if}
{:else}
  {@render lazyShared.comp.value?.(props)}
{/if}
