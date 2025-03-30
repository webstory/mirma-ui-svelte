<script module lang="ts">

  export interface CalendarItem {
    period: [string | Date, string | Date];
    title: string;
    description?: string;
    location?: string;
    coordinates?: [number, number];
    color?: string;
  }

  interface CalendarItemInner extends CalendarItem {
    period: [Date, Date];
  }

</script>

<script lang="ts">
  import { onMount } from "svelte";

  let {
    today = new Date(),
    dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    events = [],
    onEventClick = () => {},
    onDateClick = () => {},

  } : {
    today?: Date;
    dayOfWeek?: string[];
    monthNames?: string[];
    events?: CalendarItem[];
    onEventClick?: (event: { date: Date; title: string }) => void;
    onDateClick?: (date: Date) => void;
  } = $props();

  let calendar: HTMLDivElement;

  let displayYear = $state(today.getFullYear());
  let displayMonth = $state(today.getMonth());
  let focusedDate = $state(today.getDate());

  // today에 해당하는 월의 1일의 요일을 구합니다.
  const firstDayOfMonth = $derived(new Date(displayYear, displayMonth, 1));
  const firstDayOfWeek = $derived(firstDayOfMonth.getDay());

  const daysInMonth = $derived.by(() => {
    return new Date(displayYear, displayMonth + 1, 0).getDate();
  });



  const calendarItems = $derived.by(() => {
    const items: CalendarItemInner[] = [];
    events.forEach((event) => {
      const startDate = new Date(event.period[0]);
      const endDate = new Date(event.period[1]);
      items.push({
        ...event,
        period: [startDate, endDate],
      });
    });
    return items;
  });

  function getCalendarItemToday(today: Date): CalendarItemInner[] {
    const items: CalendarItemInner[] = [];
    const _today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    calendarItems.forEach((item) => {
      const start = new Date(item.period[0].getFullYear(), item.period[0].getMonth(), item.period[0].getDate());
      const end = new Date(item.period[1].getFullYear(), item.period[1].getMonth(), item.period[1].getDate());
      if (_today >= start && _today <= end) {
        items.push(item);
      }
    });
    return items;
  }

  function gotoPreviousMonth() {
    if (displayMonth === 0) {
      displayYear -= 1;
      displayMonth = 11;
    } else {
      displayMonth -= 1;
    }
  }
  function gotoNextMonth() {
    if (displayMonth === 11) {
      displayYear += 1;
      displayMonth = 0;
    } else {
      displayMonth += 1;
    }
  }
</script>


<div class="calendar">
  <div class="calendar-header">
    <button onclick={gotoPreviousMonth}>Previous</button>
    <span>{monthNames[displayMonth]} {displayYear}</span>
    <button onclick={gotoNextMonth}>Next</button>
  </div>
  <div class="day-of-week">
    {#each dayOfWeek as day}
      <div class={day.toLocaleLowerCase()}>{day}</div>
    {/each}
  </div>
  <div class="calendar-grid">
    <!-- skip until day 1 is match -->
    {#each Array(firstDayOfWeek) as _}
      <div class="empty"></div>
    {/each}
    {#each Array(daysInMonth) as _, index}
      {@const _today = new Date(displayYear, displayMonth, index + 1)}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="calendar-day" onclick={() => onDateClick(new Date(_today.getFullYear(), _today.getMonth(), index + 1))}>
        {index + 1}
        {#each getCalendarItemToday(_today) as event}
          <div class="event" onclick={(e) => { e.stopPropagation(); onEventClick(event) }}>{event.title}</div>
        {/each}
      </div>
    {/each}
  </div>
</div>


<style>
  .calendar {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 600px;
    margin: auto;
  }

  .calendar-header {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    background-color: #f0f0f0;
  }

  .day-of-week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background-color: #f0f0f0;
    padding: 10px 0;

    & > div {
      text-align: center;
      font-weight: bold;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    div.sun {
      color: red;
    }

    div.sat {
      color: blue;
    }
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
  }

  .calendar-day {
    padding: 10px;
    border: 1px solid #ccc;
    text-align: center;
  }

  .event {
    background-color: #007bff;
    color: white;
    padding: 5px;
    margin-top: 5px;
  }

  .event:hover {
    background-color: #0056b3;
  }

  .calendar-day:hover {
    background-color: #f0f0f0;
    cursor: pointer;
  }

  .calendar-day:hover .event {
    background-color: #0056b3;
  }

  .calendar-day:hover .event:hover {
    background-color: #004085;
  }


</style>