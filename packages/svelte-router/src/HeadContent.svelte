<script lang="ts">
  import Asset from './Asset.svelte'
  import { useTags } from './tags'

  let tags = useTags()
</script>

<svelte:head>
  {#each tags as tag, index (index)}
    <Asset {...tag} />
  {/each}
</svelte:head>
