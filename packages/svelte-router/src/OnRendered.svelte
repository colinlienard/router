<script lang="ts">
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
