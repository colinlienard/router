<script lang="ts">
  import { useRouter } from './useRouter'

  const router = useRouter()

  const pendingElement = router.options.defaultPendingComponent ? (
    <router.options.defaultPendingComponent />
  ) : null

  // Do not render a root Suspense during SSR or hydrating from SSR
  const ResolvedSuspense =
    router.isServer || (typeof document !== 'undefined' && router.clientSsr)
      ? SafeFragment
      : Solid.Suspense

  const inner = (
    <ResolvedSuspense fallback={pendingElement}>
      <Transitioner />
      <MatchesInner />
    </ResolvedSuspense>
  )

  return router.options.InnerWrap ? (
    <router.options.InnerWrap>{inner}</router.options.InnerWrap>
  ) : (
    inner
  )
</script>
