<script lang="ts">
  import { onMount } from "svelte";
  import Calendar from "$lib/calendar/Calendar.svelte";

  let today = $state(new Date());

  let holidays = []; // https://www.data.go.kr/data/15012690/openapi.do
  let events = [
    { period: ["2025-04-03", "2025-04-04"], title: "Event 1" },
    { period: ["2025-04-15", "2025-04-17"], title: "Event 2" },
    { period: ["2025-04-20", "2025-04-20"], title: "Event 3" },
  ];

  function handleCalendarEventClick(event) {
    alert(`Event clicked: ${event.title}`);
  }

  function handleCalendarDateClick(date) {
    alert(`Date clicked: ${date.toLocaleDateString()}`);
  }

  onMount(() => {
    // Any additional setup can be done here
  });
</script>

<div class="calendar-wrapper">
  <Calendar {today}
    events={events}
    onEventClick={handleCalendarEventClick}
    onDateClick={handleCalendarDateClick}
  />
</div>