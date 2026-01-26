<script lang="ts">
  import CalendarDisplay from './CalendarDisplay.svelte';
  import CollapsibleCard from './CollapsibleCard.svelte';
  import Config from './Config.svelte';
  import Exclusions from './Exclusions.svelte';
  import Instructions from './Instructions.svelte';
  import Spinner from './Spinner.svelte';
  import { getWorkDaysBetween } from './utils';

  interface AppState {
    rtoDataState: 'idle' | 'loading' | 'error' | 'loaded';
    rtoLoadingError?: string;
    exclusionsDataState: 'idle' | 'loading' | 'error' | 'loaded';
    exclusionsLoadingError?: string;
  }
  let appState: AppState = $state({
    rtoDataState: 'idle',
    rtoLoadingError: '',
    exclusionsDataState: 'idle',
    exclusionsLoadingError: '',
  });
  let { startStr, endStr } = $props<{
    startStr: string;
    endStr: string;
  }>();

  let requirement = $state(20); // days
  let measurementWindow = $state(13); // weeks;
  let exclusions: string[] = $state([]); // will be loaded from server
  let inOfficeDays: string[] = $state([]); // will be loaded from server

  let duration: number = $derived(getWorkDaysBetween(startStr, endStr, exclusions));
  let requiredFractionPerDay: number = $derived.by(() => requirement / measurementWindow / 5);
  let minimumDaysInOffice = $derived(Math.ceil(requiredFractionPerDay * duration));
  let metRequirement: boolean = $derived.by(() => {
    return inOfficeDays.length >= minimumDaysInOffice;
  });

  const getExclusionsFromServer = async (startStr: string, endStr: string) => {
    appState.exclusionsDataState = 'loading';
    console.log('Fetching exclusions from server for range:', startStr, 'to', endStr);
    appState.exclusionsDataState = 'loading';
    await window.google.script.run
      .withSuccessHandler((response: string[]) => {
        console.log('getExclusionsFromServer Server response:', response);
        if (response) {
          appState.exclusionsDataState = 'loaded';
          exclusions = response;
        } else {
          appState.exclusionsDataState = 'error';
          appState.exclusionsLoadingError = 'No exclusions data received from server.';
          console.warn('No exclusions data received from server.');
        }
      })
      .withFailureHandler((error: GasError) => {
        appState.exclusionsDataState = 'error';
        appState.exclusionsLoadingError = `${error.message}`;
        console.error('Error invoking getHolidaysAndExclusions on server:', error);
      })
      .getHolidaysAndExclusions('US', startStr, endStr);
  };

  const getRTODataFromServer = async (startStr: string, endStr: string) => {
    try {
      appState.rtoDataState = 'loading';
      const result = await window.google.script.run
        .withSuccessHandler((response: { inOfficeDays: string[] }) => {
          console.log('getRTODataFromServer Server response:', response);
          if (response) {
            appState.rtoDataState = 'loaded';
            inOfficeDays = response.inOfficeDays;
          } else {
            appState.rtoDataState = 'error';
            appState.rtoLoadingError = 'No data received from server.';
          }
        })
        .withFailureHandler((error: GasError) => {
          console.error('Error invoking server function:', error);
          appState.rtoDataState = 'error';
          appState.rtoLoadingError = `${error.message}`;
        })
        .checkRTO(startStr, endStr);
    } catch (error) {
      console.error('Unexpected error:', error);
      appState.rtoDataState = 'error';
      appState.rtoLoadingError = `${error}`;
    }
  };
  const getAllData = async () => {
    await getExclusionsFromServer(startStr, endStr);
    await getRTODataFromServer(startStr, endStr);
  };
  $effect(() => {
    getAllData();
  });
</script>

{#if appState.rtoDataState === 'loading' || appState.exclusionsDataState === 'loading'}
  <div class="loading">
    <p class="attention">
      <Spinner /> Loading... please be patient, this can take some time as your calendar is loaded.
    </p>
    <Instructions />
  </div>
{:else if appState.rtoDataState === 'error' || appState.exclusionsDataState === 'error'}
  <div class="error">
    <div>Error loading data from server.</div>
    <div>{appState.rtoLoadingError}</div>
  </div>
{:else if appState.rtoDataState === 'loaded' && appState.exclusionsDataState === 'loaded'}
  <main>
    <section>
      <CalendarDisplay {startStr} {endStr} {inOfficeDays} {exclusions} />
    </section>
    <aside>
      <div
        class="card"
        class:met-requirements={metRequirement}
        class:failed-requirements={!metRequirement}
      >
        <h3>RTO Status</h3>
        <div class="rto-stats">
          {inOfficeDays.length} in office / {minimumDaysInOffice} required
          {#if metRequirement}
            ✅
          {:else}
            ❌
          {/if}
        </div>
        <div class="rto-details">
          Included Work Days: {duration} <br />
        </div>
      </div>
      <CollapsibleCard header="RTO Policy" open={true}>
        <Config bind:requirement bind:measurementWindow />
      </CollapsibleCard>
      <CollapsibleCard header="Instructions" open={true}>
        <Instructions />
      </CollapsibleCard>
      <CollapsibleCard header="Exclusions List" open={false}>
        <Exclusions {exclusions} />
      </CollapsibleCard>
    </aside>
  </main>
{/if}

<style>
  main {
    display: grid;
    grid-template-columns: 2fr 1fr;
  }
  section {
    padding: 0 1rem 0 0;
    height: 100%;
  }
  aside {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  h3 {
    margin: 0;
  }
  .loading p.attention {
    font-size: 1.2rem;
    font-weight: bold;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
  .rto-stats {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  .met-requirements {
    background-color: var(--positive-color);
  }
  .failed-requirements {
    background-color: var(--negative-color);
  }
</style>
