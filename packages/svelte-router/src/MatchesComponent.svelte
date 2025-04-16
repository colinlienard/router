<script lang="ts">
  import { useRouter } from './useRouter'
  import SafeFragment from './SafeFragment.svelte'
  import MatchesInner from './MatchesInner.svelte'
  import Transitioner from './Transitioner.svelte'

  const router = useRouter()

  const pendingElement = router.options.defaultPendingComponent

  // Do not render a root Suspense during SSR or hydrating from SSR
  const ResolvedSuspense =
    router.isServer || (typeof document !== 'undefined' && router.clientSsr)
      ? SafeFragment
      : SafeFragment // use suspense

  const InnerWrap = router.options.InnerWrap || SafeFragment
</script>

<InnerWrap>
  <ResolvedSuspense {pendingElement}>
    <Transitioner />
    <MatchesInner />
  </ResolvedSuspense>
</InnerWrap>
