<script lang="ts">
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
  {#each Array(startsOn - 1) as _}
    <div class="calendar-cell empty"></div>
  {/each}
  {#each days as day}
    {@const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
    <div
      class="calendar-cell day"
      class:in-office={inOfficeDays.includes(dateStr)}
      class:out-of-office={!inOfficeDays.includes(dateStr)}
      class:excluded={exclusions.includes(dateStr)}
      class:out-of-range={dateStr < startStr || dateStr > endStr}
    >
      {day}
    </div>
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
  .calendar-cell.day {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
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
  }
  .calendar-cell.out-of-range {
    opacity: 0.4;
  }
</style>
