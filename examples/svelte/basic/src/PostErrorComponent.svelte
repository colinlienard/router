<script lang="ts">
  import {
    ErrorComponent,
    type ErrorComponentProps,
  } from '@tanstack/svelte-router'
  import { NotFoundError } from './posts'

  let { error }: ErrorComponentProps = $props()
</script>

{#if error instanceof NotFoundError}
  <div>{error.message}</div>
{:else}
  <ErrorComponent {error} />
{/if}
