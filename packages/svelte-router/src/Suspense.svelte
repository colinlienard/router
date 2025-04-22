<script lang="ts" module>
  // This is not an actual implementation of all the features of Suspense in
  // other frameworks, but rather just a component that will render a fallback
  // if one of its children is loading an asynchronous resource. So this
  // implementation is not non blocking, but it's still called Suspense so that
  // it's coherent with the the other implementations of the router.

  import { getContext, onMount, setContext } from 'svelte'

  const suspenseContextKey = Symbol()

  export function getSuspenseContext(): { value: boolean } {
    return getContext(suspenseContextKey)
  }

  export function setSuspenseContext(isLoading: { value: boolean }) {
    setContext(suspenseContextKey, isLoading)
  }

  export function useSuspense<T>(promise: () => Promise<T>): T | undefined {
    let result = $state<{ value: T | undefined }>({ value: undefined })
    let isLoading = getSuspenseContext()

    onMount(() => {
      isLoading.value = true
      promise().then((value) => {
        result.value = value
        isLoading.value = false
      })
    })

    return result.value
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children, fallback }: { children: Snippet; fallback: Snippet } =
    $props()

  let isLoading = $state({ value: false })

  setSuspenseContext(isLoading)
</script>

{#if isLoading.value}
  {@render fallback?.()}
{:else}
  {@render children?.()}
{/if}
