<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
</script>

<div class="p-2 flex gap-2 text-lg border-b">
  <Link
    to="/"
    activeProps={{
      class: 'font-bold',
    }}
    activeOptions={{ exact: true }}>Home</Link
  >{' '}
  <Link
    to="/posts"
    activeProps={{
      class: 'font-bold',
    }}>Posts</Link
  >{' '}
  <Link
    to="/route-a"
    activeProps={{
      class: 'font-bold',
    }}>Pathless Layout</Link
  >{' '}
  <Link to="/this-route-does-not-exist" activeProps={{ class: 'font-bold' }}
    >This Route Does Not Exist</Link
  >
</div>
<Outlet />
