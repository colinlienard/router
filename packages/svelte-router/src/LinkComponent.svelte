<script lang="ts" module>
  import LinkComponent from './LinkComponent.svelte'

  export { linkSnippet }
</script>

<script lang="ts">
  import type { RegisteredRouter } from '@tanstack/router-core'
  import type { LinkComponentProps } from './link.svelte'
  import { useLinkProps } from './link.svelte'

  let props: LinkComponentProps<
    any,
    RegisteredRouter,
    string,
    undefined,
    string,
    string
  > = $props()

  let { _asChild, ...rest } = props
  let { type, children: _, ...linkProps } = useLinkProps(rest)
</script>

{#if _asChild}
  {@render _asChild({ children, ...linkProps })}
{:else}
  <a {...linkProps}>
    {#if typeof rest.children === 'function'}
      {@render rest.children?.({
        isActive: linkProps['data-status'] === 'active',
        isTransitioning: false,
      })}
    {:else}
      {rest.children}
    {/if}
  </a>
{/if}

{#snippet linkSnippet(
  props: LinkComponentProps<
    any,
    RegisteredRouter,
    string,
    undefined,
    string,
    string
  >,
)}
  <LinkComponent {...props} />
{/snippet}
