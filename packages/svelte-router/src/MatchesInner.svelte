<script lang="ts">
  import ErrorComponent from './ErrorComponent.svelte'
  import CatchBoundary from './CatchBoundary.svelte'
  import Match from './Match.svelte'
  import { useRouterState } from './useRouterState.svelte.js'
  import warning from 'tiny-warning'
  import { setMatchContext } from './matchContext'

  let matchId = useRouterState({
    select: (s) => {
      return s.matches[0]?.id
    },
  })

  setMatchContext(matchId.current)
</script>

<CatchBoundary
  errorComponent={ErrorComponent}
  onCatch={(error) => {
    warning(
      false,
      `The following error wasn't caught by any route! At the very least, consider setting an 'errorComponent' in your RootRoute!`,
    )
    warning(false, error.message || error.toString())
  }}
>
  {#if matchId.current}
    {#key matchId.current}
      <Match matchId={matchId.current} />
    {/key}
  {/if}
</CatchBoundary>
