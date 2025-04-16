<script lang="ts">
  import ErrorComponent from './ErrorComponent.svelte'
  import CatchBoundary from './CatchBoundary.svelte'
  import Match from './Match.svelte'
  import { setMatchContext } from './matchContext'
  import { useRouterState } from './useRouterState'
  import warning from 'tiny-warning'

  const matchId = useRouterState({
    select: (s) => {
      return s.matches[0]?.id
    },
  })

  setMatchContext(matchId)
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
  {#if matchId}
    <Match {matchId} />
  {/if}
</CatchBoundary>
