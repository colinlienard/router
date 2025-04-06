<script
  lang="ts"
  generics="T extends Record<string, any>, TKey extends keyof T = 'default'"
>
  import Outlet from './Outlet.svelte'
  import type { AsyncRouteComponent } from './route'

  let {
    importer,
    exportName,
    ssr,
  }: { importer: () => Promise<T>; exportName?: TKey; ssr?: () => boolean } =
    $props()

  let loadPromise: Promise<any> | undefined
  let comp: T[TKey] | T['default']
  let error: any

  const load = () => {
    if (typeof document === 'undefined' && ssr?.() === false) {
      comp = (() => null) as any
      return Promise.resolve(comp)
    }
    if (!loadPromise) {
      loadPromise = importer()
        .then((res) => {
          loadPromise = undefined
          comp = res[exportName ?? 'default']
          return comp
        })
        .catch((err) => {
          error = err
        })
    }

    return loadPromise
  }

  const lazyComp = function Lazy(props: any) {
    // Now that we're out of preload and into actual render path,
    // throw the error if it was a module not found error during preload
    if (error) {
      if (isModuleNotFoundError(error)) {
        // We don't want an error thrown from preload in this case, because
        // there's nothing we want to do about module not found during preload.
        // Record the error, recover the promise with a null return,
        // and we will attempt module not found resolution during the render path.

        if (
          error instanceof Error &&
          typeof window !== 'undefined' &&
          typeof sessionStorage !== 'undefined'
        ) {
          // Again, we want to reload one time on module not found error and not enter
          // a reload loop if there is some other issue besides an old deploy.
          // That's why we store our reload attempt in sessionStorage.
          // Use error.message as key because it contains the module path that failed.
          const storageKey = `tanstack_router_reload:${error.message}`
          if (!sessionStorage.getItem(storageKey)) {
            sessionStorage.setItem(storageKey, '1')
            window.location.reload()

            // Return empty component while we wait for window to reload
            return {
              default: () => null,
            }
          }
        }
      }

      // Otherwise, just throw the error
      throw error
    }

    if (!comp) {
      const [compResource] = createResource(load, {
        initialValue: comp,
        ssrLoadFrom: 'initial',
      })
      return <>{compResource()}</>
    }

    if (ssr?.() === false) {
      return (
        <ClientOnly fallback={<Outlet />}>
          <Dynamic component={comp} {...props} />
        </ClientOnly>
      )
    }
    return <Dynamic component={comp} {...props} />
  }

  ;(lazyComp as any).preload = load

  return lazyComp as any
</script>
