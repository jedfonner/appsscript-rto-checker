<script lang="ts">
  import CalendarCell from './CalendarCell.svelte';
  import CalendarGrid from './CalendarGrid.svelte';

  let { startStr, endStr, inOfficeDays, exclusions } = $props<{
    startStr: string;
    endStr: string;
    inOfficeDays?: string[];
    exclusions?: string[];
  }>();

  // compute the months to display based on startStr and endStr
  let months: { year: number; month: number }[] = $derived.by(() => {
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    const monthList = [];
    const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (currentDate <= endDate) {
      monthList.push({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth(),
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return monthList;
  });

  // display as MMM yyyy
  const formatMonth = (year: number, month: number): string => {
    const tempDate = new Date(year, month, 1);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
    };
    return tempDate.toLocaleDateString(undefined, options);
  };
</script>

<div class="calendar-display-wrapper">
  <div class="calendar-display">
    {#each months as month}
      <div class="card">
        <div class="month-header">{formatMonth(month.year, month.month)}</div>
        <div class="calendar-grid">
          <CalendarGrid
            year={month.year}
            month={month.month}
            {startStr}
            {endStr}
            {inOfficeDays}
            {exclusions}
          />
        </div>
      </div>
    {/each}
  </div>
  <div class="card">
    <h3>Legend</h3>
    <div class="legend-items">
      <div>
        <p>Out of range</p>
        <div class="legend-item"><CalendarCell day={1} isOutOfRange={true} /></div>
      </div>
      <div>
        <p>Excluded</p>
        <div class="legend-item"><CalendarCell day={2} isExcluded={true} /></div>
      </div>
      <div>
        <p>In Office</p>
        <div class="legend-item"><CalendarCell day={3} inOffice={true} /></div>
      </div>
      <div>
        <p>WFH</p>
        <div class="legend-item"><CalendarCell day={4} /></div>
      </div>
    </div>
  </div>
</div>

<style>
  .calendar-display-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .calendar-display {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .month-header {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    text-align: center;
  }
  h3 {
    margin: 0;
  }
  .legend-items {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 1rem;
  }
  .legend-items p {
    margin: 0.5rem 0 0.25rem 0;
  }
  .legend-item {
    width: 5dvw;
    height: 50px;
  }
</style>
