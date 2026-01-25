<script lang="ts">
  import { formatDate } from './utils';

  let { exclusions } = $props<{
    exclusions: string[];
  }>();
</script>

<ul>
  {#each exclusions as dateStr}
    <li>{formatDate(dateStr)}</li>
  {/each}
</ul>
