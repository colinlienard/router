<script lang="ts">
  import {
    _resolvePromptBlockerArgs,
    type PromptProps,
    useBlocker,
  } from './useBlocker.svelte'

  let { children, ...rest }: PromptProps = $props()
  const args = _resolvePromptBlockerArgs(rest)

  const resolver = useBlocker(args)
</script>

{#if typeof children === 'function'}
  {@render children(resolver)}
{/if}
