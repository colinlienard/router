<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
</script>

<div class="p-2 flex gap-2 text-lg border-b">
  <Link to="/" activeOptions={{ exact: true }}>Home</Link>{' '}
  <Link to="/posts">Posts</Link>{' '}
  <Link to="/route-a">Pathless Layout</Link>{' '}
  <Link to="/this-route-does-not-exist">This Route Does Not Exist</Link>
</div>
<Outlet />
