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

<button onclick={updateConfig}> Update </button>
