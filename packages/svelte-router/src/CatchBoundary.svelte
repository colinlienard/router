<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { ErrorRouteComponent } from './route.js'
  import ErrorComponent from './ErrorComponent.svelte'

  let props: {
    children: Snippet
    errorComponent?: ErrorRouteComponent
    onCatch?: (error: Error) => void
  } = $props()
</script>

<svelte:boundary onerror={(error) => props.onCatch?.(error)}>
  {@render props.children()}
  {#snippet failed(error, reset)}
    {#if props.errorComponent}
      {@render props.errorComponent({ error: error as Error, reset })}
    {:else}
      <ErrorComponent {error} />
    {/if}
  {/snippet}
</svelte:boundary>
