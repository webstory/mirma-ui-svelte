<script module lang="ts">
  const SUPPORT_TOUCH = 'ontouchstart' in window;
  const EVENTS = {
    start: SUPPORT_TOUCH ? 'touchstart' : 'mousedown',
    move: SUPPORT_TOUCH ? 'touchmove' : 'mousemove',
    end: SUPPORT_TOUCH ? 'touchend' : 'mouseup',
  };
  const SWITCH_THRESHOLD = 50;

  function toPos(event: MouseEvent | TouchEvent) {
    return SUPPORT_TOUCH ?
      (event as TouchEvent).changedTouches[0].pageX :
      (event as MouseEvent).pageX;
  }

</script>

<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";

  import {
    fromEvent,
    map,
    startWith,
    takeUntil,
    merge,
    mergeAll,
    switchMap,
    take,
    first,
    share,
    from,
    withLatestFrom,
    scan,
  } from 'rxjs';
  import { AppStoreLogo } from "phosphor-svelte";

  const {
    panels,
    panelTemplate
  }:{
    panels: any[];
    panelTemplate: (args: any[]) => Snippet;
  } = $props();

  let carouselWrapper = $state<HTMLDivElement | null>(null);
  let carouselContainer = $state<HTMLDivElement | null>(null);

  const width = $derived(carouselWrapper?.clientWidth || 0);
  const height = $derived(carouselWrapper?.clientHeight || 0);

  let currentPanelIndex = $state(0);
  const panelLength = $derived(panels?.length || 0);

  onMount(() => {
    const start$ = fromEvent(carouselWrapper, EVENTS.start)
      .pipe(map(toPos))
    ;
    const move$ = fromEvent(window, EVENTS.move)
      .pipe(map(toPos))
    ;

    const end$ = fromEvent(window, EVENTS.end);

    const size$ = fromEvent(window, 'resize').pipe(
      startWith(0),
      map(() => carouselWrapper.clientWidth),
      share(),
    );

    const drag$ = start$.pipe(
      switchMap(start => move$.pipe(
        map(move => { return { distance: move - start }}),
        takeUntil(end$)
      )),
      share(),
    );
    const drop$ = drag$.pipe(
      switchMap((drag) => end$.pipe(
        map(() => drag),
        first()
      )),
      withLatestFrom(size$, (drag, size) => { return { ...drag, size }}),
    );
    const carousel$ = merge(drag$, drop$).pipe(
      scan((store, {distance, size}) => {
        const updateStore = {
          from: -(store.index * store.size) + distance,
        };

        if (size === undefined) { // drag
          updateStore.to = updateStore.from;
        } else { // drop
          let toBeIndex = store.index;
          if(Math.abs(distance) > SWITCH_THRESHOLD) {
            let step = Math.floor(Math.abs(distance) / size);
            toBeIndex = store.index - (step * Math.sign(distance));
            if(toBeIndex < 0) toBeIndex = 0;
            if(toBeIndex >= panelLength) toBeIndex = panelLength - 1;
          }
          updateStore.to = -(toBeIndex * size);
          updateStore.index = toBeIndex;
          updateStore.size = size;
        }

        return { ...store, ...updateStore };
      }, {
        from: 0,
        to: 0,
        index: 0,
        size: 0,
      })
    );

    carousel$.subscribe(store => {
      if(!carouselContainer) return;
      carouselContainer.style.transform = `translateX(${store.to}px)`;
    });

    // const timer = setInterval(() => {
    //   if (!carouselContainer) return;
    //   if (panelLength === 0) return;
    //   currentPanelIndex = (currentPanelIndex + 1) % panelLength;
    //   carouselContainer.style.transform = `translateX(-${currentPanelIndex * 100}%)`;
    // }, 5000);

    // return () => clearInterval(timer);
  });

</script>

<div class="carousel" bind:this={carouselWrapper}>
  <ul class="container" bind:this={carouselContainer}>
    {#each panels as panelArgument}
      <li>
        {@render panelTemplate(panelArgument)}
      </li>
    {/each}
  </ul>

</div>

<style>
  .carousel {
    overflow: hidden;
    contain: strict;
    content-visibility: auto;
    width: 100%;
    height: 100%;
    min-height: 300px;
  }

  .carousel * {
    pointer-events: none;
    user-select: none;
  }

  .carousel ul.container {
    white-space: nowrap;
    display: flex;
    height: 100%;
    gap: 0;
    padding: 0;
    margin: 0;
    list-style: none;
    /* transition: transform 0.5s ease-in-out; */

    li {
      flex: 0 0 100%;
      display: inline-block;
    }
  }
</style>