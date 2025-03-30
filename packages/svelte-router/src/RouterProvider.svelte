<script lang="ts" module>
  export type RouterProps<
    TRouter extends AnyRouter = RegisteredRouter,
    TDehydrated extends Record<string, any> = Record<string, any>,
  > = Omit<
    RouterOptions<
      TRouter['routeTree'],
      NonNullable<TRouter['options']['trailingSlash']>,
      false,
      TRouter['history'],
      TDehydrated
    >,
    'context'
  > & {
    router: TRouter
    context?: Partial<
      RouterOptions<
        TRouter['routeTree'],
        NonNullable<TRouter['options']['trailingSlash']>,
        false,
        TRouter['history'],
        TDehydrated
      >['context']
    >
  }
</script>

<script
  lang="ts"
  generics="TRouter extends AnyRouter = RegisteredRouter,TDehydrated extends Record<string, any> = Record<string, any>"
>
  import type {
    AnyRouter,
    RegisteredRouter,
    RouterOptions,
  } from '@tanstack/router-core'
  import { setRouterContext } from './routerContext'

  let { router, ...rest }: RouterProps<TRouter, TDehydrated> = $props()

  // Allow the router to update options on the router instance
  router.update({
    ...router.options,
    ...rest,
    context: {
      ...router.options.context,
      ...rest.context,
    },
  })

  setRouterContext(router)
</script>

{#if router.options.Wrap}
  <router.options.Wrap>
    <!-- TODO: Matches component -->
  </router.options.Wrap>
{:else}
  <!-- TODO: Matches component -->
{/if}
