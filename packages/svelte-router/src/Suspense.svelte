<script lang="ts" module>
  // This is not an actual implementation of all the features of Suspense in
  // other frameworks, but rather just a component that will render a fallback
  // if one of its children is loading an asynchronous resource. So this
  // implementation is not non blocking, but it's still called Suspense so that
  // it's coherent with the the other implementations of the router.

  import { getContext, setContext } from 'svelte'

  const suspenseContextKey = Symbol()

  function getSuspenseContext(): { value: boolean } {
    return getContext(suspenseContextKey)
  }

  function setSuspenseContext(isLoading: { value: boolean }) {
    setContext(suspenseContextKey, isLoading)
  }

  export function useSuspense<T>(promise: () => Promise<T>): Promise<T> {
    let isLoading = getSuspenseContext()

    return new Promise((resolve) => {
      isLoading.value = true
      promise().then((value) => {
        resolve(value)
        isLoading.value = false
      })
    })
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children, fallback }: { children: Snippet; fallback?: Snippet } =
    $props()

  let isLoading = $state({ value: true })

  setSuspenseContext(isLoading)
</script>

{#if isLoading.value}
  {@render fallback?.()}
{/if}
{@render children?.()}
