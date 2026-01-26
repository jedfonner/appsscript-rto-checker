<script lang="ts">
  let {
    day,
    inOffice = false,
    isExcluded = false,
    isOutOfRange = false,
  } = $props<{
    day: number;
    inOffice?: boolean;
    isExcluded?: boolean;
    isOutOfRange?: boolean;
  }>();
</script>

<div
  class="calendar-cell day"
  class:in-office={inOffice}
  class:out-of-office={!inOffice}
  class:excluded={isExcluded}
  class:out-of-range={isOutOfRange}
>
  {day}
</div>

<style>
  .calendar-cell.day {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    border: 1px solid var(--foreground-color);
    border-radius: 0.25rem;
    font-size: 1.25rem;
    padding: 0.25em;
  }
  .calendar-cell.in-office {
    background-color: var(--accent-color);
  }
  .calendar-cell.excluded {
    background-color: var(--disabled-color);
    filter: brightness(0.8);
    position: relative;
  }
  .calendar-cell.excluded:after {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    background-color: var(--foreground-color);
    left: 0;
    top: 50%;
    transform: rotate(-25deg);
  }
  .calendar-cell.out-of-range {
    opacity: 0.4;
  }
</style>
