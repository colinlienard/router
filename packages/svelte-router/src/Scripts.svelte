<script lang="ts">
  import Asset from './Asset.svelte'
  import { useRouterState } from './useRouterState.svelte.js'
  import { useRouter } from './useRouter'
  import type { RouterManagedTag } from '@tanstack/router-core'

  const router = useRouter()

  const assetScripts = useRouterState({
    select: (state) => {
      const assetScripts: Array<RouterManagedTag> = []
      const manifest = router.ssr?.manifest

      if (!manifest) {
        return []
      }

      state.matches
        .map((match) => router.looseRoutesById[match.routeId]!)
        .forEach((route) =>
          manifest.routes[route.id]?.assets
            ?.filter((d) => d.tag === 'script')
            .forEach((asset) => {
              assetScripts.push({
                tag: 'script',
                attrs: asset.attrs,
                children: asset.children,
              } as any)
            }),
        )

      return assetScripts
    },
  })

  const scripts = useRouterState({
    select: (state) => ({
      scripts: (
        state.matches
          .map((match) => match.scripts!)
          .flat(1)
          .filter(Boolean) as Array<RouterManagedTag>
      ).map(({ children, ...script }) => ({
        tag: 'script',
        attrs: {
          ...script,
        },
        children,
      })),
    }),
  })

  const allScripts = [
    ...scripts.current.scripts,
    ...assetScripts.current,
  ] as Array<RouterManagedTag>
</script>

{#each allScripts as asset, index (index)}
  <Asset {...asset} />
{/each}
