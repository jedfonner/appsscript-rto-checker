<script lang="ts">
  import svelteLogo from './assets/svelte.svg';
  import gasLogo from './assets/appsscript.svg';
  import RTOChecker from './lib/RTOChecker.svelte';
</script>

<div id="main">
  <h1>RTO Tracker</h1>
  <RTOChecker />
</div>

<style>
  #main {
    height: 100%;
    width: 100%;
  }
  h1 {
    text-align: center;
  }
</style>
