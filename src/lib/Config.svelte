<script lang="ts">
  let { requirement = $bindable(20), measurementWindow = $bindable(13) } = $props<{
    requirement: number;
    measurementWindow: number;
  }>();

  let requirementTemp = $state(requirement);
  let measurementWindowTemp = $state(measurementWindow);

  let updateConfig = () => {
    requirement = requirementTemp;
    measurementWindow = measurementWindowTemp;
  };
</script>

<div class="config-input">
  <label for="requirement">Minimum Days in Office</label>
  <input name="requirement" type="number" bind:value={requirementTemp} min="0" />
</div>

<div class="config-input">
  <label for="window">Per # of Weeks </label>
  <input name="window" type="number" bind:value={measurementWindowTemp} min="1" />
</div>

<div class="config-apply">
  <button onclick={updateConfig}> Update </button>
</div>

<style>
  .config-input {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin: 1rem 0;
  }
  label {
    width: 200px;
  }
  input {
    width: 100px;
    padding: 0.25rem;
    font-size: 1rem;
  }
  .config-apply {
    display: flex;
    justify-content: flex-end;
  }
  button {
    font-size: 1rem;
    padding: 0.25rem 0.5rem;
  }
</style>
