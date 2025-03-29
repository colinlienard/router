<script lang="ts" generics="T">
  import { Snippet } from 'svelte'
  import { AwaitOptions } from './awaited'

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
