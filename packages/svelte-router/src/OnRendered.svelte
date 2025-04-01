<script lang="ts">
  // On Rendered can't happen above the root layout because it actually
  // renders a dummy dom element to track the rendered state of the app.
  // We render a script tag with a key that changes based on the current
  // location state.key. Also, because it's below the root layout, it
  // allows us to fire onRendered events even after a hydration mismatch
  // error that occurred above the root layout (like bad head/link tags,
  // which is common).
  import { getLocationChangeInfo } from '@tanstack/router-core'
  import { useRouter } from './useRouter'
  import { useRouterState } from './useRouterState'

  const router = useRouter()

  const location = useRouterState({
    select: (s) => {
      return s.resolvedLocation?.state.key
    },
  })

  $effect(() => {
    location
    router.emit({
      type: 'onRendered',
      ...getLocationChangeInfo(router.state),
    })
  })
</script>
