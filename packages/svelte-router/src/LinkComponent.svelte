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
  > & { _asChild: any } = $props()

  let { _asChild, ...rest } = props
  let rawLinkProps = useLinkProps(rest)
  let linkProps = $derived.by(() => {
    const {
      type: _type,
      children: _children,
      ...linkProps
    } = rawLinkProps.current
    return linkProps
  })
</script>

<svelte:element this={_asChild ?? 'a'} {...linkProps}>
  {#if typeof rest.children === 'function'}
    {@render rest.children?.({
      isActive: linkProps['data-status'] === 'active',
      isTransitioning: false,
    })}
  {:else}
    {rest.children}
  {/if}
</svelte:element>

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
