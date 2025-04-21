<script lang="ts" generics="T">
  import type { Snippet } from 'svelte'
  import type { AwaitOptions } from './awaited.js'

  let props: AwaitOptions<T> & {
    fallback?: Snippet
    children: Snippet<[T]>
  } = $props()
</script>

{#await props.promise}
  {@render props.fallback?.()}
{:then data}
  {@render props.children?.(data)}
{/await}
