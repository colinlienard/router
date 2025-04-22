import lazyComp from './LazyComponent.svelte'
import type { AsyncRouteComponent } from './route'

export const lazyShared = $state<{
  error: any
  comp: any
  ssr: boolean | undefined
  load: () => Promise<any>
}>({ error: null, comp: null, load: () => Promise.resolve(null), ssr: false })

export function lazyRouteComponent<
  T extends Record<string, any>,
  TKey extends keyof T = 'default',
>(
  importer: () => Promise<T>,
  exportName?: TKey,
  ssr?: boolean,
): T[TKey] extends (props: infer TProps) => any
  ? AsyncRouteComponent<TProps>
  : never {
  let loadPromise: Promise<any> | undefined
  lazyShared.ssr = ssr

  const load = () => {
    if (typeof document === 'undefined' && ssr === false) {
      lazyShared.comp = null
      return Promise.resolve(lazyShared.comp)
    }
    if (!loadPromise) {
      loadPromise = importer()
        .then((res) => {
          loadPromise = undefined
          lazyShared.comp = res[exportName ?? 'default']
          return lazyShared.comp
        })
        .catch((err) => {
          lazyShared.error = err
        })
    }

    return loadPromise
  }

  lazyShared.load = load
  ;(lazyComp as any).preload = load

  return lazyComp as any
}
