<script lang="ts">
  let {
    startStr = $bindable(),
    endStr = $bindable(),
    country = $bindable(),
  } = $props<{
    startStr: string;
    endStr: string;
    country: 'CA' | 'UK' | 'US';
  }>();

  let start: string = $state(startStr);
  let end: string = $state(endStr);

  let submit = () => {
    startStr = start;
    endStr = end;
  };
</script>

<div class="date-range">
  <!-- top row -->
  <div class="label">From</div>
  <div></div>
  <div class="label">To</div>
  <div></div>
  <div></div>
  <!-- second row -->

  <div class="picker">
    <input type="date" bind:value={start} />
  </div>
  <div class="divider">➙</div>
  <div class="picker">
    <input type="date" bind:value={end} />
  </div>
  <select name="counter-picker" bind:value={country}>
    <option value="CA">🇨🇦 CA</option>
    <option value="UK">🇬🇧 UK </option>
    <option value="US">🇺🇸 US</option>
  </select>
  <div class="button-wrapper">
    <button onclick={submit}> Update RTO </button>
  </div>
</div>

<style>
  .date-range {
    --font-size: 1.5rem;
    display: grid;
    grid-template-columns: 1fr auto 1fr auto auto;
    align-items: flex-end;
    gap: 0 1rem;
  }
  .picker {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .label {
    font-size: 0.9rem;
  }
  .picker input[type='date'] {
    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
    font-size: var(--font-size);
    padding: 0 0.25rem;
    color: var(--foreground-color);
  }
  .divider {
    font-size: 2rem;
    line-height: 1;
    align-self: center;
  }
  .button-wrapper {
    height: 100%;
  }
  select {
    font-size: 1rem;
    padding: 0 0.5rem;
    height: 100%;
    border-radius: 0.25rem;
    background-color: var(--background-color);
    color: var(--foreground-color);
  }
  button {
    height: 100%;
    font-size: var(--font-size);
    padding: 0 0.5rem;
    background-color: var(--accent-color);
    color: var(--foreground-color);
    border: 1px solid var(--foreground-color);
    border-radius: 0.25rem;
    min-width: max-content;
  }
  button:hover {
    transform: scale(1.05);
  }
  button:active {
    transform: scale(0.95);
  }
</style>
