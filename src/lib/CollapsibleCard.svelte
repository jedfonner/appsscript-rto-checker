<script lang="ts">
  let {
    header,
    open = true,
    children,
  } = $props<{
    header: string;
    open?: boolean;
    children: () => unknown;
  }>();

  let isOpen: boolean = $state(open);
</script>

<div class="card">
  <div class="top-row">
    <h3>{header}</h3>
    <div>
      <button onclick={() => (isOpen = !isOpen)}>
        {isOpen ? '▼' : '▲'}
      </button>
    </div>
  </div>
  {#if isOpen}
    {@render children?.()}
  {/if}
</div>

<style>
  .top-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  h3 {
    margin: 0;
  }
  button {
    background: none;
    border: none;
    color: var(--accent-color);
    font-size: 1.2rem;
    cursor: pointer;
  }
  button:hover {
    transform: scale(1.2);
  }
  button:active {
    transform: scale(0.9);
  }
</style>
