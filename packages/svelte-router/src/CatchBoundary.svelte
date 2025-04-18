<script lang="ts">
  import { Snippet } from 'svelte'
  import type { ErrorRouteComponent } from './route'
  import ErrorComponent from './ErrorComponent.svelte'

  let props: {
    children: Snippet
    errorComponent?: ErrorRouteComponent
    onCatch?: (error: Error) => void
  } = $props()
</script>

<svelte:boundary onerror={console.log}>
  {@render props.children()}
  {#snippet failed(error, reset)}
    {#if props.errorComponent}
      {@render props.errorComponent({ error: error as Error, reset })}
    {:else}
      <ErrorComponent {error}></ErrorComponent>
    {/if}
  {/snippet}
</svelte:boundary>
