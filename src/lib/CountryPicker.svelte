<script lang="ts">
  let { country = $bindable() } = $props<{
    country: 'CA' | 'UK' | 'US';
  }>();
</script>

<select bind:value={country}>
  <option value="CA">🇨🇦</option>
  <option value="UK">🇬🇧</option>
  <option value="US">🇺🇸</option>
</select>

<style>
  select {
    font-size: 1rem;
    padding: 0.5rem;
    height: fit-content;
  }
</style>
