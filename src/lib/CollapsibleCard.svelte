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

  const toggle = (e: Event) => {
    e.preventDefault();
    isOpen = !isOpen;
  };
</script>

<div class="card">
  <div
    class="top-row"
    onclick={toggle}
    onkeydown={toggle}
    role="button"
    tabindex="0"
    title={isOpen ? 'Click to collapse' : 'Click to expand'}
  >
    <h3>{header}</h3>
    <div class="arrows">
      {isOpen ? '▼' : '▲'}
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
    cursor: pointer;
  }
  h3 {
    margin: 0;
  }
  .arrows {
    color: var(--accent-color);
    font-size: 1.5rem;
    line-height: 1rem;
  }
</style>
