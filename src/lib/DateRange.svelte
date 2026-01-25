<script lang="ts">
  import rightArrowIcon from '../assets/right-arrow.svg';

  let { startStr = $bindable(), endStr = $bindable() } = $props<{
    startStr: string;
    endStr: string;
  }>();

  let start: string = $state(startStr);
  let end: string = $state(endStr);

  let submit = () => {
    startStr = start;
    endStr = end;
  };
</script>

<div class="date-range flex">
  <div class="picker">
    <input type="date" bind:value={start} />
  </div>
  <div class="divider">
    <img src={rightArrowIcon} alt="to" />
  </div>
  <div class="picker"><input type="date" bind:value={end} /></div>
  <div>
    <button onclick={submit}> Update RTO </button>
  </div>
</div>

<style>
  .date-range {
    --font-size: 1.5rem;
  }
  .picker {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .picker input[type='date'] {
    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
    font-size: var(--font-size);
    padding: 0.25rem;
  }
  .divider img {
    width: 2rem;
    height: 2rem;
  }
  button {
    font-size: var(--font-size);
    padding: 0.25rem 0.5rem;
    background-color: var(--accent-color);
    color: var(--foreground-color);
    border: 1px solid var(--foreground-color);
    border-radius: 0.25rem;
    height: 100%;
  }
  button:hover {
    transform: scale(1.05);
  }
  button:active {
    transform: scale(0.95);
  }
  .flex {
    display: flex;
    gap: 1rem;
  }
</style>
