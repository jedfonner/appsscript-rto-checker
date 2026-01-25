<script lang="ts">
  import { formatDate } from './utils';

  interface ComponentState {
    exclusionsDataState: 'idle' | 'loading' | 'error' | 'loaded';
    exclusionsLoadingError?: string;
  }
  let componentState: ComponentState = $state({
    exclusionsDataState: 'idle',
    exclusionsLoadingError: '',
  });

  let { startStr, endStr } = $props<{
    startStr: string;
    endStr: string;
  }>();

  let exclusions: string[] = $state([]);

  const getExclusionsFromServer = async (startStr: string, endStr: string) => {
    componentState.exclusionsDataState = 'loading';
    console.log('Fetching exclusions from server for range:', startStr, 'to', endStr);
    componentState.exclusionsDataState = 'loading';
    await window.google.script.run
      .withSuccessHandler((response: string[]) => {
        // the response is void because testInvokationFromClient does not return anything
        // update the type if your server function returns a value
        console.log('Server response:', response);
        if (response) {
          componentState.exclusionsDataState = 'loaded';
          exclusions = response;
        } else {
          componentState.exclusionsDataState = 'error';
          componentState.exclusionsLoadingError = 'No exclusions data received from server.';
          console.warn('No exclusions data received from server.');
        }
      })
      .withFailureHandler((error: GasError) => {
        componentState.exclusionsDataState = 'error';
        componentState.exclusionsLoadingError = `${error.message}`;
        console.error('Error invoking getHolidaysAndExclusions on server:', error);
      })
      .getHolidaysAndExclusions('US', startStr, endStr);
  };

  $effect(() => {
    getExclusionsFromServer(startStr, endStr);
  });
</script>

{#if componentState.exclusionsDataState === 'loading'}
  <div>Loading...</div>
{:else if componentState.exclusionsDataState === 'error'}
  <div>Error loading data from server.</div>
  <div>{componentState.exclusionsLoadingError}</div>
{:else if componentState.exclusionsDataState === 'loaded'}
  <ul>
    {#each exclusions as dateStr}
      <li>{formatDate(dateStr)}</li>
    {/each}
  </ul>
{/if}
