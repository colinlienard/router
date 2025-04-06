<script lang="ts">
  import type { RouterManagedTag } from '@tanstack/router-core'

  let { tag, attrs, children }: RouterManagedTag = $props()
</script>

{#if tag === 'title'}
  <title {...attrs}>{children}</title>
{:else if tag === 'meta'}
  <meta {...attrs} />
{:else if tag === 'link'}
  <link {...attrs} />
{:else if tag === 'style'}
  <style {...attrs} bind:innerHTML={children} contenteditable></style>
{:else if tag === 'script'}
  {#if attrs && attrs.src}
    <script {...attrs}></script>
  {:else if typeof children === 'string'}
    <script {...attrs} bind:innerHTML={children} contenteditable></script>
  {/if}
{/if}
