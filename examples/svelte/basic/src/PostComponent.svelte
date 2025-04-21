<script lang="ts">
  import { postRoute } from './main'

  const post = postRoute.useLoaderData()
</script>

<div class="space-y-2">
  <h4 class="text-xl font-bold">{post.title}</h4>
  <hr class="opacity-20" />
  <div class="text-sm">{post.body}</div>
</div>
