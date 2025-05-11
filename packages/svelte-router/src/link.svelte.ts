import {
  deepEqual,
  exactPathTest,
  functionalUpdate,
  preloadWarning,
  removeTrailingSlash,
} from '@tanstack/router-core'
import { useRouterState } from './useRouterState.svelte.js'
import { useRouter } from './useRouter'

import { useIntersectionObserver } from './utils.svelte'

import { useMatches } from './matches.svelte'
// @ts-expect-error TODO: fix
import { linkSnippet } from './LinkComponent.svelte'
import type { Snippet } from 'svelte'
import type {
  AnyRouter,
  Constrain,
  LinkCurrentTargetElement,
  LinkOptions,
  RegisteredRouter,
  RoutePaths,
} from '@tanstack/router-core'
import type {
  ValidateLinkOptions,
  ValidateLinkOptionsArray,
} from './typePrimitives'
import type { HTMLAnchorAttributes, HTMLAttributes } from 'svelte/elements'

export function useLinkProps<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends RoutePaths<TRouter['routeTree']> | string = string,
  TTo extends string = '',
  TMaskFrom extends RoutePaths<TRouter['routeTree']> | string = TFrom,
  TMaskTo extends string = '',
>(
  options: UseLinkPropsOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo>,
): { current: HTMLAnchorAttributes } {
  const router = useRouter()
  let isTransitioning = $state(false)
  let hasRenderFetched = false

  // custom props
  const activeProps = options.activeProps || (() => ({ class: 'active' }))
  const inactiveProps = options.inactiveProps || (() => ({}))
  const activeOptions = options.activeOptions
  const to = options.to
  const userPreload = options.preload
  const userPreloadDelay = options.preloadDelay
  const hashScrollIntoView = options.hashScrollIntoView
  const replace = options.replace
  const startTransition = options.startTransition
  const resetScroll = options.resetScroll
  const viewTransition = options.viewTransition
  // element props
  const children = options.children
  const target = options.target
  const disabled = options.disabled
  const style = options.style
  const className = options.class
  const onclick = options.onclick
  const onfocus = options.onfocus
  const onmouseenter = options.onmouseenter
  const onmouseleave = options.onmouseleave
  const ontouchstart = options.ontouchstart
  const ignoreBlocker = options.ignoreBlocker

  // Create safe props that can be spread
  const propsSafeToSpread: Record<string, any> = {}
  for (const key in options) {
    if (
      ![
        'activeProps',
        'inactiveProps',
        'activeOptions',
        'to',
        'preload',
        'preloadDelay',
        'hashScrollIntoView',
        'replace',
        'startTransition',
        'resetScroll',
        'viewTransition',
        'children',
        'target',
        'disabled',
        'style',
        'class',
        'onClick',
        'onFocus',
        'onMouseEnter',
        'onMouseLeave',
        'onMouseOver',
        'onMouseOut',
        'onTouchStart',
        'ignoreBlocker',
        'params',
        'search',
        'hash',
        'state',
        'mask',
        'reloadDocument',
      ].includes(key)
    ) {
      propsSafeToSpread[key] = options[key as any]
    }
  }

  // If this link simply reloads the current route,
  // make sure it has a new key so it will trigger a data refresh

  // If this `to` is a valid external URL, return
  // null for LinkUtils

  const type: 'internal' | 'external' = (() => {
    try {
      new URL(`${to}`)
      return 'external'
    } catch {}
    return 'internal'
  })()

  const currentSearch = useRouterState({
    select: (s) => s.location.searchStr,
  })

  // when `from` is not supplied, use the leaf route of the current matches as the `from` location
  // so relative routing works as expected
  const from = useMatches({
    select: (matches) => options.from ?? matches[matches.length - 1]?.fullPath,
  })

  const _options = () => ({
    ...options,
    from: from.current,
  })

  const next = $derived.by(() => {
    currentSearch.current
    return router.buildLocation(_options() as any)
  })

  const preload = $derived.by(() => {
    if (_options().reloadDocument) {
      return false
    }
    return userPreload ?? router.options.defaultPreload
  })

  const preloadDelay = () =>
    userPreloadDelay ?? router.options.defaultPreloadDelay ?? 0

  const isActive = useRouterState({
    select: (s) => {
      if (activeOptions?.exact) {
        const testExact = exactPathTest(
          s.location.pathname,
          next.pathname,
          router.basepath,
        )
        if (!testExact) {
          return false
        }
      } else {
        const currentPathSplit = removeTrailingSlash(
          s.location.pathname,
          router.basepath,
        ).split('/')
        const nextPathSplit = removeTrailingSlash(
          next?.pathname,
          router.basepath,
        )?.split('/')

        const pathIsFuzzyEqual = nextPathSplit?.every(
          (d, i) => d === currentPathSplit[i],
        )
        if (!pathIsFuzzyEqual) {
          return false
        }
      }

      if (activeOptions?.includeSearch ?? true) {
        const searchTest = deepEqual(s.location.search, next.search, {
          partial: !activeOptions?.exact,
          ignoreUndefined: !activeOptions?.explicitUndefined,
        })
        if (!searchTest) {
          return false
        }
      }

      if (activeOptions?.includeHash) {
        return s.location.hash === next.hash
      }
      return true
    },
  })

  const doPreload = () =>
    router.preloadRoute(_options() as any).catch((err: any) => {
      console.warn(err)
      console.warn(preloadWarning)
    })

  const preloadViewportIoCallback = (
    entry: IntersectionObserverEntry | undefined,
  ) => {
    if (entry?.isIntersecting) {
      doPreload()
    }
  }

  const ref = $state<Element | null>(null)

  useIntersectionObserver(
    ref,
    preloadViewportIoCallback,
    { rootMargin: '100px' },
    { disabled: !!disabled || !(preload === 'viewport') },
  )

  $effect(() => {
    if (hasRenderFetched) {
      return
    }
    if (!disabled && preload === 'render') {
      doPreload()
      hasRenderFetched = true
    }
  })

  if (type === 'external') {
    return {
      get current() {
        return {
          ...propsSafeToSpread,
          // ref: innerRef as React.ComponentPropsWithRef<'a'>['ref'],
          type,
          href: to,
          ...(children && { children }),
          ...(target && { target }),
          ...(disabled && { disabled }),
          ...(style && { style }),
          ...(className && { class: className }),
          ...(onclick && { onclick }),
          ...(onfocus && { onfocus }),
          ...(onmouseenter && { onmouseenter }),
          ...(onmouseleave && { onmouseleave }),
          ...(ontouchstart && { ontouchstart }),
        }
      },
    }
  }

  // The click handler
  const handleClick = (e: MouseEvent) => {
    if (
      !disabled &&
      !isCtrlEvent(e) &&
      !e.defaultPrevented &&
      (!target || target === '_self') &&
      e.button === 0
    ) {
      e.preventDefault()

      isTransitioning = true

      const unsub = router.subscribe('onResolved', () => {
        unsub()
        isTransitioning = false
      })

      // All is well? Navigate!
      // N.B. we don't call `router.commitLocation(next) here because we want to run `validateSearch` before committing
      return router.navigate({
        ..._options(),
        replace: replace,
        resetScroll: resetScroll,
        hashScrollIntoView: hashScrollIntoView,
        startTransition: startTransition,
        viewTransition: viewTransition,
        ignoreBlocker: ignoreBlocker,
      } as any)
    }
  }

  // The click handler
  const handleFocus = (_: MouseEvent) => {
    if (disabled) return
    if (preload) {
      doPreload()
    }
  }

  const handleTouchStart = handleFocus

  const handleEnter = (e: MouseEvent) => {
    if (disabled) return
    const eventTarget = (e.target || {}) as LinkCurrentTargetElement

    if (preload) {
      if (eventTarget.preloadTimeout) {
        return
      }

      eventTarget.preloadTimeout = setTimeout(() => {
        eventTarget.preloadTimeout = null
        doPreload()
      }, preloadDelay())
    }
  }

  const handleLeave = (e: MouseEvent) => {
    if (disabled) return
    const eventTarget = (e.target || {}) as LinkCurrentTargetElement

    if (eventTarget.preloadTimeout) {
      clearTimeout(eventTarget.preloadTimeout)
      eventTarget.preloadTimeout = null
    }
  }

  function composeEventHandlers<T>(
    handlers: Array<undefined | null | ((e: any) => void)>,
  ) {
    return (event: any) => {
      for (const handler of handlers) {
        handler?.(event)
      }
    }
  }

  // Get the active props
  const resolvedActiveProps: () => HTMLAnchorAttributes = () =>
    isActive.current ? (functionalUpdate(activeProps as any, {}) ?? {}) : {}

  // Get the inactive props
  const resolvedInactiveProps: () => HTMLAnchorAttributes = () =>
    isActive.current ? {} : functionalUpdate(inactiveProps, {})

  const resolvedClassName = () =>
    [className, resolvedActiveProps().class, resolvedInactiveProps().class]
      .filter(Boolean)
      .join(' ')

  const resolvedStyle = {
    // @ts-expect-error TODO: fix
    ...style,
    // @ts-expect-error TODO: fix
    ...resolvedActiveProps.style,
    // @ts-expect-error TODO: fix
    ...resolvedInactiveProps.style,
  }

  const href = $derived.by(() => {
    const nextLocation = next
    const maskedLocation = nextLocation?.maskedLocation

    return _options().disabled
      ? undefined
      : maskedLocation
        ? router.history.createHref(maskedLocation.href)
        : router.history.createHref(nextLocation?.href)
  })

  return {
    get current() {
      return {
        ...propsSafeToSpread,
        ...resolvedActiveProps,
        ...resolvedInactiveProps,
        href,
        onclick: composeEventHandlers([onclick, handleClick]),
        onfocus: composeEventHandlers([onfocus, handleFocus]),
        onmouseenter: composeEventHandlers([onmouseenter, handleEnter]),
        onmouseleave: composeEventHandlers([onmouseleave, handleLeave]),
        ontouchstart: composeEventHandlers([ontouchstart, handleTouchStart]),
        disabled: !!disabled,
        target: target,
        ...(Object.keys(resolvedStyle).length && { style: resolvedStyle }),
        ...(resolvedClassName() && { class: resolvedClassName() }),
        ...(disabled && {
          role: 'link',
          'aria-disabled': true,
        }),
        ...(isActive.current && {
          'data-status': 'active',
          'aria-current': 'page',
        }),
        ...(isTransitioning ? { 'data-transitioning': 'transitioning' } : {}),
      }
    },
  }
}

export type UseLinkPropsOptions<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends RoutePaths<TRouter['routeTree']> | string = string,
  TTo extends string | undefined = '.',
  TMaskFrom extends RoutePaths<TRouter['routeTree']> | string = TFrom,
  TMaskTo extends string = '.',
> = ActiveLinkOptions<'a', TRouter, TFrom, TTo, TMaskFrom, TMaskTo> &
  HTMLAnchorAttributes

export type ActiveLinkOptions<
  TComp = 'a',
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends string = string,
  TTo extends string | undefined = '.',
  TMaskFrom extends string = TFrom,
  TMaskTo extends string = '.',
> = LinkOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo> &
  ActiveLinkOptionProps<TComp>

type ActiveLinkProps<TComp> = Partial<
  LinkComponentSvelteProps<TComp> & {
    [key: `data-${string}`]: unknown
  }
>

export interface ActiveLinkOptionProps<TComp = 'a'> {
  /**
   * A function that returns additional props for the `active` state of this link.
   * These props override other props passed to the link (`style`'s are merged, `class`'s are concatenated)
   */
  activeProps?: ActiveLinkProps<TComp> | (() => ActiveLinkProps<TComp>)
  /**
   * A function that returns additional props for the `inactive` state of this link.
   * These props override other props passed to the link (`style`'s are merged, `class`'s are concatenated)
   */
  inactiveProps?: ActiveLinkProps<TComp> | (() => ActiveLinkProps<TComp>)
}

export type LinkProps<
  TComp = 'a',
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends string = string,
  TTo extends string | undefined = '.',
  TMaskFrom extends string = TFrom,
  TMaskTo extends string = '.',
> = ActiveLinkOptions<TComp, TRouter, TFrom, TTo, TMaskFrom, TMaskTo> &
  LinkPropsChildren

export interface LinkPropsChildren {
  // If a function is passed as a child, it will be given the `isActive` boolean to aid in further styling on the element it returns
  children?:
    | Snippet
    | Snippet<
        [
          {
            isActive: boolean
            isTransitioning: boolean
          },
        ]
      >
}

type LinkComponentSvelteProps<TComp> = TComp extends HTMLBaseElement
  ? Omit<HTMLAttributes<TComp>, keyof CreateLinkProps> & {
      children: Snippet | string
    }
  : never

export type LinkComponentProps<
  TComp = 'a',
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends string = string,
  TTo extends string | undefined = '.',
  TMaskFrom extends string = TFrom,
  TMaskTo extends string = '.',
> = LinkComponentSvelteProps<TComp> &
  LinkProps<TComp, TRouter, TFrom, TTo, TMaskFrom, TMaskTo>

export type CreateLinkProps = LinkProps<
  any,
  any,
  string,
  string,
  string,
  string
>

export type LinkComponent<TComp> = <
  TRouter extends AnyRouter = RegisteredRouter,
  const TFrom extends string = string,
  const TTo extends string | undefined = undefined,
  const TMaskFrom extends string = TFrom,
  const TMaskTo extends string = '',
>(
  props: LinkComponentProps<TComp, TRouter, TFrom, TTo, TMaskFrom, TMaskTo>,
) => Snippet<
  [LinkComponentProps<TComp, TRouter, TFrom, TTo, TMaskFrom, TMaskTo>]
>

export function createLink<const TComp>(
  Comp: Constrain<TComp, any, Snippet<[CreateLinkProps]>>,
): LinkComponent<TComp> {
  return (props) => linkSnippet({ ...props, _asChild: Comp })
}

function isCtrlEvent(e: MouseEvent) {
  return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
}

export type LinkOptionsFnOptions<
  TOptions,
  TComp,
  TRouter extends AnyRouter = RegisteredRouter,
> =
  TOptions extends ReadonlyArray<any>
    ? ValidateLinkOptionsArray<TRouter, TOptions, string, TComp>
    : ValidateLinkOptions<TRouter, TOptions, string, TComp>

export type LinkOptionsFn<TComp> = <
  const TOptions,
  TRouter extends AnyRouter = RegisteredRouter,
>(
  options: LinkOptionsFnOptions<TOptions, TComp, TRouter>,
) => TOptions

export const linkOptions: LinkOptionsFn<'a'> = (options) => {
  return options as any
}
