<script lang="ts">
  import CalendarCell from './CalendarCell.svelte';

  let { year, month, startStr, endStr, inOfficeDays, exclusions } = $props<{
    year: number;
    month: number;
    startStr: string;
    endStr: string;
    inOfficeDays?: string[];
    exclusions?: string[];
  }>();

  let days = $derived.by(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayList = [];
    for (let day = 1; day <= daysInMonth; day++) {
      // exclude weekends
      const dt = new Date(year, month, day);
      if (dt.getUTCDay() === 0 || dt.getUTCDay() === 6) {
        continue;
      }
      dayList.push(day);
    }
    return dayList;
  });
  let startsOn = $derived.by(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    return firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
  });
</script>

<div class="calendar-grid">
  {#each ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as day}
    <div class="calendar-cell header">{day}</div>
  {/each}
  <!-- Calendar grid for {year}-{month + 1} -->
  {#if startsOn > 0}
    {#each Array(startsOn - 1) as _}
      <div class="calendar-cell empty"></div>
    {/each}
  {/if}
  {#each days as day}
    {@const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
    {@const inOffice = inOfficeDays.includes(dateStr)}
    {@const isExcluded = exclusions.includes(dateStr)}
    {@const isOutOfRange = dateStr < startStr || dateStr > endStr}
    <CalendarCell {day} {inOffice} {isExcluded} {isOutOfRange} />
  {/each}
</div>

<style>
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
  }
  .calendar-cell {
    width: auto;
    height: auto;
  }
  .calendar-cell.header {
    font-weight: bold;
    text-align: center;
    height: 1.5rem;
    width: 100%;
  }
</style>
