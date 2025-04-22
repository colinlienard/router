<script lang="ts" generics="T">
  import type { Snippet } from 'svelte'
  import type { AwaitOptions } from './awaited.js'
  import { useSuspense } from './Suspense.svelte'

  let props: AwaitOptions<T> & {
    fallback?: Snippet
    children: Snippet<[T]>
  } = $props()

  let data = useSuspense(() => props.promise)
</script>

{#if data}
  {@render props.children?.(data)}
{:else}
  {@render props.fallback?.()}
{/if}
