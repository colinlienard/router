<script lang="ts">
  import jsesc from 'jsesc'

  let {
    children,
    log,
  }: {
    children: string
    log?: boolean
    sync?: boolean
  } = $props()
</script>

{#if typeof document === 'undefined'}
  {@html `<script class="tsr-once">${[
    children,
    log && process.env.NODE_ENV === 'development'
      ? `console.info(\`Injected From Server:
  ${jsesc(children.toString(), { quotes: 'backtick' })}\`)`
      : '',
    'if (typeof __TSR_SSR__ !== "undefined") __TSR_SSR__.cleanScripts()',
  ]}</script>`}
{/if}
