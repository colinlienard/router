<script lang="ts">
  import type { Snippet } from 'svelte'
  import { isNotFound } from '@tanstack/router-core'
  import CatchBoundary from './CatchBoundary.svelte'
  import type { NotFoundError } from '@tanstack/router-core'
  import ErrorComponent from './ErrorComponent.svelte'

  let props: {
    fallback?: Snippet<[{ error: NotFoundError }]>
    onCatch?: (error: Error) => void
    children: Snippet
  } = $props()
</script>

<CatchBoundary
  onCatch={(error) => {
    if (isNotFound(error)) {
      props.onCatch?.(error)
    } else {
      throw error
    }
  }}
  {errorComponent}
>
  {@render props.children()}
</CatchBoundary>

{#snippet errorComponent({ error }: { error: Error })}
  {#if isNotFound(error)}
    {@render props.fallback?.({ error })}
  {:else}
    <ErrorComponent {error} />
  {/if}
{/snippet}
