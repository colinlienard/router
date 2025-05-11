<script lang="ts" generics="T">
  import type { Snippet } from 'svelte'
  import type { AwaitOptions } from './awaited.js'
  import { useSuspense } from './Suspense.svelte'

  let props: AwaitOptions<T> & {
    fallback?: Snippet
    children: Snippet<[T]>
  } = $props()

  let promise = useSuspense(() => props.promise)
</script>

{#await promise}
  {@render props.fallback?.()}
{:then data}
  {@render props.children?.(data)}
{/await}
