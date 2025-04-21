import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/svelte-router'
import { createRawSnippet, mount } from 'svelte'
import PostErrorComponent from './PostErrorComponent.svelte'
import PostComponent from './PostComponent.svelte'
import { fetchPost, fetchPosts } from './posts'
import RootComponent from './RootComponent.svelte'
import './styles.css'

const rootRoute = createRootRoute({
  component: RootComponent,
  notFoundComponent: createRawSnippet(() => ({
    render: () => `
      <div>
        <p>This is the notFoundComponent configured on root route</p>
      </div>
    `,
    setup(target) {
      mount(Link, { target, props: { children: 'Start Over', to: '/' } })
    },
  })),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: createRawSnippet(() => ({
    render: () => `
      <div>
        <h3>Welcome Home!</h3>
      </div>
    `,
  })),
})

export const postsLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'posts',
  loader: () => fetchPosts(),
}).lazy(() => import('./posts.lazy.svelte').then((d) => d.Route))

const postsIndexRoute = createRoute({
  getParentRoute: () => postsLayoutRoute,
  path: '/',
  component: createRawSnippet(() => ({
    render: () => `
      <div>
        <h3>Select a post.</h3>
      </div>
    `,
  })),
})

export const postRoute = createRoute({
  getParentRoute: () => postsLayoutRoute,
  path: '$postId',
  errorComponent: PostErrorComponent,
  loader: ({ params }) => fetchPost(params.postId),
  component: PostComponent,
})

const pathlessLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_pathlessLayout',
  component: createRawSnippet(() => ({
    render: () => `
      <div class="p-2">
        <div class="border-b">I'm a pathless layout</div>
      </div>
    `,
    setup(target) {
      mount(Outlet, { target })
    },
  })),
})

const nestedPathlessLayout2Route = createRoute({
  getParentRoute: () => pathlessLayoutRoute,
  id: '_nestedPathlessLayout',
  component: createRawSnippet(() => ({
    render: () => `
      <div>
      <div>I'm a nested pathless layout</div>
      </div>
    `,
    setup(target) {
      mount(Link, {
        target,
        props: { children: 'Go to route A', to: '/route-a' },
      })
      mount(Link, {
        target,
        props: { children: 'Go to route B', to: '/route-b' },
      })
      mount(Outlet, { target })
    },
  })),
})

const pathlessLayoutARoute = createRoute({
  getParentRoute: () => nestedPathlessLayout2Route,
  path: '/route-a',
  component: createRawSnippet(() => ({
    render: () => `<div>I'm route A!</div>`,
  })),
})

const pathlessLayoutBRoute = createRoute({
  getParentRoute: () => nestedPathlessLayout2Route,
  path: '/route-b',
  component: createRawSnippet(() => ({
    render: () => `<div>I'm route B!</div>`,
  })),
})

const routeTree = rootRoute.addChildren([
  postsLayoutRoute.addChildren([postRoute, postsIndexRoute]),
  pathlessLayoutRoute.addChildren([
    nestedPathlessLayout2Route.addChildren([
      pathlessLayoutARoute,
      pathlessLayoutBRoute,
    ]),
  ]),
  indexRoute,
])

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultStaleTime: 5000,
  scrollRestoration: true,
})

// Register things for typesafety
declare module '@tanstack/svelte-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  mount(RouterProvider, { target: rootElement, props: { router } })
}
