<script lang="ts" module>
  import LinkComponent from './LinkComponent.svelte'

  export { linkSnippet }
</script>

<script lang="ts">
  import { RegisteredRouter } from '@tanstack/router-core'
  import { LinkComponentProps } from './link.svelte.ts'
  import { useLinkProps } from './link.svelte.ts'

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

  const children = () =>
    typeof rest.children === 'function'
      ? rest.children({
          get isActive() {
            return (linkProps as any)['data-status'] === 'active'
          },
        })
      : rest.children
</script>

{#if _asChild}
  {@render _asChild({ children, ...linkProps })}
{:else}
  <a {...linkProps}>
    {children}
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
