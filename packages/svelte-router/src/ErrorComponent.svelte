<script lang="ts">
  let { error }: { error: any } = $props()
  console.log(error)

  let show = $state(process.env.NODE_ENV !== 'production')
</script>

<div style:padding=".5rem" style:max-width="100%">
  <div style:display="flex" style:align-items="center" style:gap=".5rem">
    <strong style:font-size="1rem">Something went wrong!</strong>
    <button
      style:appearance="none"
      style:font-size=".6em"
      style:border="1px solid currentColor"
      style:padding=".1rem .2rem"
      style:font-weight="bold"
      style:border-radius=".25rem"
      onclick={() => (show = !show)}
    >
      {#if show}
        Hide Error
      {:else}
        Show Error
      {/if}
    </button>
  </div>
  <div style:height=".25rem"></div>
  {#if show}
    <div>
      <pre
        style:font-size=".7em"
        style:border="1px solid red"
        style:border-radius=".25rem"
        style:padding=".3rem"
        style:color="red"
        style:overflow="auto">
        {#if error?.message}
          <code>{error.message}</code>
        {/if}
      </pre>
    </div>
  {/if}
</div>
