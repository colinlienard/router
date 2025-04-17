<script
  lang="ts"
  generics="TRouter extends AnyRouter = RegisteredRouter,TDehydrated extends Record<string, any> = Record<string, any>"
>
  import type { AnyRouter, RegisteredRouter } from '@tanstack/router-core'
  import { setRouterContext } from './routerContext'
  import { RouterProps } from './router.ts'

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
