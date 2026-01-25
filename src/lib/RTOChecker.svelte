<script lang="ts">
  interface AppState {
    state: 'idle' | 'loading' | 'error' | 'loaded';
    loadingError?: string;
  }
  let appState = $state({
    rtoDataState: 'idle',
    rtoLoadingError: '',
    exclusionsDataState: 'idle',
    exclusionsLoadingError: '',
  });
  let requirement = $state(20); // days
  let measurementWindow = $state(13); // weeks;
  let exclusions: string[] = $state([]);
  let inOfficeDays: string[] = $state([]);

  let endStr = $state(new Date().toISOString().slice(0, 10));
  $inspect('End', endStr);

  // 13 weeks ago
  let startStr = $state(
    // svelte-ignore state_referenced_locally
    new Date(Date.now() - measurementWindow * 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
  );
  $inspect('Start', startStr);

  const getWorkDaysBetween = (
    startStr: string,
    endStr: string,
    exclusions: string[],
  ): number => {
    // Calculates the number of workdays (Mon-Fri) between two dates, excluding specified dates
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    let workDaysCount = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const dateStr = currentDate.toISOString().slice(0, 10);
        if (!exclusions.includes(dateStr)) {
          workDaysCount++;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return workDaysCount;
  };

  let duration: number = $derived(getWorkDaysBetween(startStr, endStr, exclusions));

  $inspect('Duration', duration);
  let requiredFractionPerDay: number = $derived.by(() => requirement / measurementWindow / 5);
  $inspect('Required Fraction Per Day', requiredFractionPerDay);
  let minimumDaysInOffice = $derived(Math.ceil(requiredFractionPerDay * duration));
  $inspect('Minimum Days In Office', minimumDaysInOffice);

  const getExclusionsFromServer = async (startStr: string, endStr: string) => {
    appState.exclusionsDataState = 'loading';
    console.log('Fetching exclusions from server for range:', startStr, 'to', endStr);
    appState.exclusionsDataState = 'loading';
    await window.google.script.run
      .withSuccessHandler((response: string[]) => {
        // the response is void because testInvokationFromClient does not return anything
        // update the type if your server function returns a value
        console.log('Server response:', response);
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

  $effect(() => {
    getExclusionsFromServer(startStr, endStr);
  });

  const reset = async () => {
    inOfficeDays = [];
    appState.rtoDataState = 'idle';
    appState.rtoLoadingError = '';
  };

  const updateConfig = () => {
    reset();
    startStr = new Date(Date.now() - measurementWindow * 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
  };

  const formatDate = (dateStr: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', // "Thursday"
      year: 'numeric', // "2026"
      month: 'long', // "January"
      day: 'numeric', // "15"
      timeZone: 'UTC',
    };
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', options);
  };

  const getServerData = async () => {
    try {
      reset();
      appState.rtoDataState = 'loading';
      const result = await window.google.script.run
        .withSuccessHandler((response: { inOfficeDays: string[] }) => {
          // the response is void because testInvokationFromClient does not return anything
          // update the type if your server function returns a value
          console.log('Server response:', response);
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
</script>

<main>
  <aside>
    <h3>Instructions</h3>
    <p>
      This app will pull your Google Calendar and specifically compute all the days where you
      set your Working Location to be in the office.
    </p>
    <p>
      It will not work if you do not use the Working Location feature in Google Calendar. See <a
        href="https://support.google.com/calendar/answer/7638168?hl=en&co=GENIE.Platform%3DDesktop"
        target="_blank">here</a
      > for how to set up your Working Location in Google Calendar.
    </p>
    <p>
      It will also not work if you are not diligent about updating your Working Location in
      Google Calendar when you deviate from your normal in-office schedule.
    </p>
    <h3>RTO Expectation</h3>

    <div class="config-input">
      <label for="requirement">Minimum Days in Office</label>
      <input name="requirement" type="number" bind:value={requirement} min="0" />
    </div>

    <div class="config-input">
      <label for="window">Per # of Weeks </label>
      <input name="window" type="number" bind:value={measurementWindow} min="1" />
    </div>

    <button onclick={updateConfig}> Update </button>
  </aside>
  <section>
    <div class="card">
      <div>From <input type="date" bind:value={startStr} onchange={() => reset()} /></div>
      <div>To <input type="date" bind:value={endStr} onchange={() => reset()} /></div>
      <div>
        <button onclick={getServerData}> Check RTO </button>
      </div>
    </div>
    <div class="card">
      <div class="result">
        {#if appState.rtoDataState === 'loading'}
          <div>Loading...</div>
        {:else if appState.rtoDataState === 'error'}
          <div>Error loading data from server.</div>
          <div>{appState.rtoLoadingError}</div>
        {:else if appState.rtoDataState === 'loaded'}
          <div>Number of included work days:</div>
          <div class="rto-count">
            {duration}
          </div>
          <div>Required minimum in-office days:</div>
          <div class="rto-count">
            {minimumDaysInOffice}
          </div>
          <div>Your in-office days:</div>
          <div
            class="rto-count"
            class:positive={inOfficeDays.length >= requirement}
            class:negative={inOfficeDays.length < requirement}
          >
            {inOfficeDays.length}
          </div>

          <div>
            {#if new Date(endStr) >= new Date()}
              <p class="small">(including planned future in-office days)</p>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </section>
  <aside class="exclusions">
    <h3>Holidays & Exclusions</h3>
    {#if appState.exclusionsDataState === 'loading'}
      <div>Loading...</div>
    {:else if appState.exclusionsDataState === 'error'}
      <div>Error loading data from server.</div>
      <div>{appState.exclusionsLoadingError}</div>
    {:else if appState.exclusionsDataState === 'loaded'}
      <ul>
        {#each exclusions as dateStr}
          <li>{formatDate(dateStr)}</li>
        {/each}
      </ul>
    {/if}
  </aside>
</main>

<style>
  main {
    /* height: 100%; */
    display: grid;
    grid-template-columns: 400px 1fr 400px;
  }
  section {
    padding: 0 1rem;
    /* border-right: 1px solid #333; */
    height: 100%;
    text-align: center;
  }
  aside {
    margin: 0 1rem;
    padding: 1rem;
  }
  aside {
    background-color: #ddd;
    color: #333;
    border: 1px solid #333;
    border-radius: 0.5rem;
  }
  .card {
    display: flex;
    flex-direction: row;
    gap: 1em;
    align-items: center;
    justify-content: center;
  }
  h3 {
    margin-top: 0;
  }
  ul {
    padding-left: 1.5rem;
  }
  li {
    white-space: nowrap;
  }
  .small {
    font-size: 0.8em;
  }
  .positive {
    font-weight: bold;
    color: #007700;
  }
  .negative {
    font-weight: bold;
    color: #cc0000;
  }
  div.config-input {
    margin-bottom: 1rem;
  }
  label {
    display: block;
  }
  button {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.5em 1em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #414141ff;
    cursor: pointer;
    transition: border-color 0.25s;
  }
  button:hover {
    border-color: #646cff;
    transform: scale(1.02);
  }
  button:active {
    transform: scale(0.97);
  }
  button:focus,
  button:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
  }
  .result {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  /* p { */
  /* margin: 0; */
  /* font-size: 1.2em; */
  /* } */
  .rto-count {
    font-weight: 700;
    font-size: 10rem;
    line-height: 7rem;
    margin-bottom: 2rem;
  }

  @media (prefers-color-scheme: light) {
    button {
      background-color: #c6c6c6ff;
    }
  }
</style>
