<script lang="ts">
  import type { AnyRoute, AnyRouter } from '@tanstack/router-core'
  import warning from 'tiny-warning'

  let props: { router: AnyRouter; route: AnyRoute; data: any } = $props()

  if (
    !props.route.options.notFoundComponent &&
    !props.router.options.defaultNotFoundComponent &&
    process.env.NODE_ENV === 'development'
  ) {
    warning(
      props.route.options.notFoundComponent,
      `A notFoundError was encountered on the route with ID "${props.route.id}", but a notFoundComponent option was not configured, nor was a router level defaultNotFoundComponent configured. Consider configuring at least one of these to avoid TanStack Router's overly generic defaultNotFoundComponent (<div>Not Found<div>)`,
    )
  }
</script>

{#if !props.route.options.notFoundComponent}
  {#if props.router.options.defaultNotFoundComponent}
    {@render props.router.options.defaultNotFoundComponent(props.data)}
  {:else}
    <p>Not Found</p>
  {/if}
{:else}
  {@render props.route.options.notFoundComponent(props.data)}
{/if}
