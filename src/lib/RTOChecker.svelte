<script lang="ts">
  const EXCLUSIONS_US = [
    '2025-09-01',
    '2025-10-13',
    '2025-11-11',
    '2025-11-24',
    '2025-11-25',
    '2025-11-26',
    '2025-11-27',
    '2025-11-28',
    '2025-12-22',
    '2025-12-23',
    '2025-12-24',
    '2025-12-25',
    '2025-12-26',
    '2025-12-29',
    '2025-12-30',
    '2025-12-31',
    '2026-01-01',
    '2026-01-02',
    '2026-01-19',
    '2026-02-16',
    '2026-05-25',
    '2026-06-19',
    '2026-06-29',
    '2026-06-30',
    '2026-07-01',
    '2026-07-02',
    '2026-07-03',
    '2026-09-07',
    '2026-10-12',
    '2026-11-11',
    '2026-11-23',
    '2026-11-24',
    '2026-11-25',
    '2026-11-26',
    '2026-11-27',
  ];

  const ROLLOWING_WINDOW_DURATION_WEEKS = 13;
  const RTO_EXPECTATION = 20; //per 13 weeks rolling time period (65 eligible in-office days)
  const LOOK_INTO_THE_FUTURE_WEEKS = 4;

  let endStr = $state(new Date().toISOString().slice(0, 10));
  $inspect('End', endStr);

  // 13 weeks ago
  let startStr = $state(
    new Date(Date.now() - ROLLOWING_WINDOW_DURATION_WEEKS * 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
  );
  $inspect('Start', startStr);
  let inOfficeDays: Date[] = $state([]);
  interface AppState {
    state: 'idle' | 'loading' | 'error' | 'loaded';
    loadingError?: string;
  }
  let appState = $state({
    state: 'idle',
    loadingError: '',
  });

  const formatDate = (dateStr: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', // "Thursday"
      year: 'numeric', // "2026"
      month: 'long', // "January"
      day: 'numeric', // "15"
    };
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', options);
  };

  const getServerData = async () => {
    try {
      //@ts-ignore
      if (!globalThis.inGAS) {
        console.warn('Not running in GAS environment. Loading local data.');
        inOfficeDays = [
          new Date('2025-10-20'),
          new Date('2025-10-21'),
          new Date('2025-10-23'),
          new Date('2025-10-27'),
          new Date('2025-10-28'),
          new Date('2025-10-30'),
          new Date('2025-11-03'),
          new Date('2025-11-04'),
          new Date('2025-11-06'),
          new Date('2025-11-12'),
          new Date('2025-11-13'),
          new Date('2025-11-18'),
          new Date('2025-11-22'),
          new Date('2025-11-23'),
          new Date('2025-12-01'),
          new Date('2025-12-02'),
          new Date('2025-12-04'),
          new Date('2025-12-08'),
          new Date('2025-12-09'),
          new Date('2025-12-11'),
          new Date('2025-12-16'),
          new Date('2026-01-06'),
          new Date('2026-01-08'),
          new Date('2026-01-12'),
          new Date('2026-01-13'),
          new Date('2026-01-18'),
        ];
        appState.state = 'loaded';
      } else {
        console.log('Running in GAS environment. Invoking server function.');
        appState.state = 'loading';
        const result = await google.script.run
          .withSuccessHandler((response: { inOfficeDays: Date[] }) => {
            // the response is void because testInvokationFromClient does not return anything
            // update the type if your server function returns a value
            console.log('Server response:', response);
            appState.state = 'loaded';
            inOfficeDays = response.inOfficeDays;
          })
          .withFailureHandler((error: GasError) => {
            console.error('Error invoking server function:', error);
            appState.state = 'error';
            appState.loadingError = `${error.message}`;
          })
          .checkRTO(startStr, endStr);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      appState.state = 'error';
      appState.loadingError = `${error}`;
    }
  };
</script>

<main>
  <aside></aside>
  <section>
    <div class="card">
      <div>Start <input type="date" bind:value={startStr} /></div>
      <div>End <input type="date" bind:value={endStr} /></div>
      <div>
        <button onclick={getServerData}> Check RTO </button>
      </div>
    </div>
    <div class="card">
      <div class="result">
        {#if appState.state === 'loading'}
          <div>Loading...</div>
        {:else if appState.state === 'error'}
          <div>Error loading data from server.</div>
        {:else if appState.state === 'loaded'}
          <div class="rto-count">
            {inOfficeDays.length}
          </div>
          <div>
            <p>Days in the office</p>
            {#if new Date(endStr) >= new Date()}
              <p class="small">(including planned future in-office days)</p>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </section>
  <aside class="exclusions">
    <h3>Exclusions</h3>
    <p class="small">
      In <span class="active">green</span> if included in the selected date range
    </p>
    <ul>
      {#each EXCLUSIONS_US as dateStr}
        {@const isWithinRange =
          new Date(dateStr) >= new Date(startStr) && new Date(dateStr) <= new Date(endStr)}
        <li class:active={isWithinRange}>{formatDate(dateStr)}</li>
      {/each}
    </ul>
  </aside>
</main>

<style>
  main {
    height: 100%;
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
  aside.exclusions {
    background-color: #ddd;
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
  .active {
    font-weight: bold;
    color: #007700;
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
  }
  p {
    margin: 0;
    font-size: 1.2em;
  }
  .rto-count {
    font-size: 10em;
    font-weight: 700;
    line-height: 1;
  }

  @media (prefers-color-scheme: light) {
    button {
      background-color: #c6c6c6ff;
    }
  }
</style>
