<script lang="ts">
  import { onMount } from 'svelte';
  import DateRange from './lib/DateRange.svelte';
  import RTOChecker from './lib/RTOChecker.svelte';

  let endStr = $state(new Date().toISOString().slice(0, 10));
  // 13 weeks ago
  let startStr = $state(
    // svelte-ignore state_referenced_locally
    new Date(Date.now() - 13 * 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );
  const DARK_PREFERENCE = '(prefers-color-scheme: dark)';
  const prefersDarkThemes = () => window.matchMedia(DARK_PREFERENCE).matches;
  let theme = $state('light');

  onMount(() => {
    if (prefersDarkThemes()) {
      theme = 'dark';
    }
  });
  const toggleTheme = () => {
    if (theme == 'dark') {
      document.getElementById('main')?.classList.remove('dark-theme');
      document.getElementById('main')?.classList.add('light-theme');
      theme = 'light';
    } else {
      document.getElementById('main')?.classList.add('dark-theme');
      document.getElementById('main')?.classList.remove('light-theme');
      theme = 'dark';
    }
  };
</script>

<div id="main">
  <header>
    <h1>
      RTO Tracker
      {#if theme == 'light'}
        <button onclick={toggleTheme} onkeydown={toggleTheme} title="Change to dark theme"
          >☀️</button
        >
      {:else}
        <button onclick={toggleTheme} onkeydown={toggleTheme} title="Change to light theme"
          >🌙</button
        >
      {/if}
    </h1>
    <DateRange bind:startStr bind:endStr />
  </header>
  <RTOChecker {startStr} {endStr} />
</div>

<style>
  #main {
    padding: 2rem;
    height: 100%;
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
    display: flex;
    flex-direction: row;
    gap: 1rem;
    justify-content: center;
  }
  button {
    color: unset;
    height: unset;
    width: unset;
    background-color: unset;
    border: unset;
    font-size: 2rem;
  }
</style>
