<script lang="ts">
  import DateRange from './lib/DateRange.svelte';
  import RTOChecker from './lib/RTOChecker.svelte';

  let endStr = $state(new Date().toISOString().slice(0, 10));
  // 13 weeks ago
  let startStr = $state(
    // svelte-ignore state_referenced_locally
    new Date(Date.now() - 13 * 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );
</script>

<div id="main">
  <header>
    <h1>RTO Tracker</h1>
    <DateRange bind:startStr bind:endStr />
  </header>
  <RTOChecker {startStr} {endStr} />
</div>

<style>
  #main {
    height: 100%;
    width: 100%;
  }
  header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  h1 {
    font-size: 3rem;
    margin: 0;
  }
</style>
