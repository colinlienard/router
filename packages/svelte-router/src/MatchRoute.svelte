<script
  lang="ts"
  generics="TRouter extends AnyRouter = RegisteredRouter, const TFrom extends string = string, const TTo extends string | undefined = undefined, const TMaskFrom extends string = TFrom, const TMaskTo extends string = ''"
>
  import type { AnyRouter, RegisteredRouter } from '@tanstack/router-core'

  import { useRouterState } from './useRouterState'
  import { type MakeMatchRouteOptions, useMatchRoute } from './matches.svelte'

  let props: MakeMatchRouteOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo> =
    $props()

  let status = useRouterState({
    select: (s) => s.status,
  })

  const matchRoute = useMatchRoute()
  const params = matchRoute(props as any) as boolean
</script>

{#if status}
  {#if typeof props.children === 'function'}
    {@render (props.children as any)?.(params)}
  {:else}
    {@render (props.children as any)?.()}
  {/if}
{/if}
