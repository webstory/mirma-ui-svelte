<script module lang="ts">
  const SUPPORT_TOUCH = 'ontouchstart' in window;
  const EVENTS = {
    start: SUPPORT_TOUCH ? 'touchstart' : 'mousedown',
    move: SUPPORT_TOUCH ? 'touchmove' : 'mousemove',
    end: SUPPORT_TOUCH ? 'touchend' : 'mouseup',
  };
  const SWITCH_THRESHOLD = 50;

  const zStack = new Map<Symbol, HTMLElement>();

  function toPos(event: MouseEvent | TouchEvent): {x: number, y: number} {
    if (SUPPORT_TOUCH) {
      const touch = (event as TouchEvent).changedTouches[0];
      return { x: touch.pageX, y: touch.pageY };
    } else {
      const mouse = event as MouseEvent;
      return { x: mouse.pageX, y: mouse.pageY };
    }
  }

  function setToTop(id: Symbol) {
    const element = zStack.get(id);
    if (!element) return;

    let z = 1000;

    zStack.delete(id);
    zStack.set(id, element);

    for(const [key, el] of zStack) {
      el.style.zIndex = `${z}`;
      z += 1;
    }
  }
</script>

<script lang="ts">
  import {
    pipe,
    map,

    of,
    from,
    fromEvent,

    merge,
    mergeMap,
    takeUntil,
    switchMap,

    take,
    first,
    share,
    withLatestFrom,
    scan,
  } from 'rxjs';

  import XIcon from 'phosphor-svelte/lib/X';
  import { onMount } from 'svelte';

  const windowElementId = Symbol();

  const {
    show = true,
    children,
    class: classNames,
    style: initialStyle = "",
    titlebarStyle = "",
    title = "Untitled",
    onClose = () => {},
  } = $props();

  function close() {
    onClose();
  }

  let windowElement: HTMLDivElement | null = null;
  let titleElement: HTMLDivElement | null = null;
  let computedStyle = $state(initialStyle);

  function createResizeStream(direction: string, windowElement: HTMLDivElement) {
    const handle = windowElement?.querySelector(`.resize-handle.${direction}`);
    if (!handle) {
      return of(null);
    }

    return fromEvent(handle, EVENTS.start)
      .pipe(
        map(toPos),
        map(startPos => {
          const rect = windowElement?.getBoundingClientRect();
          if (!rect) return { direction, startPos, rect: { top: 0, left: 0, width: 0, height: 0 } };
          return { direction, startPos, rect };
        }),
        switchMap(({ direction, startPos, rect }) => fromEvent(window, EVENTS.move)
          .pipe(
            map(toPos),
            takeUntil(fromEvent(window, EVENTS.end)),
            scan((acc, pos) => {
              const diff = {
                x: pos.x - startPos.x,
                y: pos.y - startPos.y,
              };
              return { direction, diff, rect };
            }, { direction, diff: { x: 0, y: 0 }, rect }),
            share(),
          )
        )
      );
  }

  onMount(() => {
    zStack.set(windowElementId, windowElement);

    const windowMove$ = fromEvent(titleElement, EVENTS.start)
      .pipe(
        map(toPos),
        map(startPos => {
          return {
            x: startPos.x - windowElement?.getBoundingClientRect().left,
            y: startPos.y - windowElement?.getBoundingClientRect().top,
          };
        }),
        switchMap(startPos => fromEvent(window, EVENTS.move)
          .pipe(
            map(toPos),
            takeUntil(fromEvent(window, EVENTS.end)),
            scan((acc, pos) => {
              return {
                x: pos.x - startPos.x,
                y: pos.y - startPos.y,
              }
            }, { x: 0, y: 0 }),
            share(),
          )
        )
      );

    windowMove$.subscribe(pos => {
      if (windowElement) {
        windowElement.style.top = `${pos.y}px`;
        windowElement.style.left = `${pos.x}px`;
      }
    });


    // Resize Drag
    const windowResize$ = of('top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right')
      .pipe(
        mergeMap((direction) => createResizeStream(direction, windowElement)),
      );

    windowResize$.subscribe(({ direction, diff, rect }) => {
      if (!windowElement) return;
      const style = windowElement.style;
      const { top, left, width, height } = rect;
      const { x, y } = diff;
      switch (direction) {
        case 'top':
          style.height = `${height - y}px`;
          style.top = `${top + y}px`;
          break;
        case 'right':
          style.width = `${width + x}px`;
          break;
        case 'bottom':
          style.height = `${height + y}px`;
          break;
        case 'left':
          style.width = `${width - x}px`;
          style.left = `${left + x}px`;
          break;
        case 'top-left':
          style.width = `${width - x}px`;
          style.height = `${height - y}px`;
          style.top = `${top + y}px`;
          style.left = `${left + x}px`;
          break;
        case 'top-right':
          style.width = `${width + x}px`;
          style.height = `${height - y}px`;
          style.top = `${top + y}px`;
          break;
        case 'bottom-left':
          style.width = `${width - x}px`;
          style.height = `${height + y}px`;
          style.left = `${left + x}px`;
          break;
        case 'bottom-right':
          style.width = `${width + x}px`;
          style.height = `${height + y}px`;
          break;
      }
    });

    return () => {
      zStack.delete(windowElementId);
    };
  });
</script>

{#snippet header()}
  <header class="title-bar" style={titlebarStyle}>
    <h1 class="title" bind:this={titleElement}>{title}</h1>
    <div class="buttons">
      <button onclick={close}><XIcon size={24} color="var(--icon-color)"/></button>
    </div>
  </header>
{/snippet}

<div
  bind:this = {windowElement}
  class={`resizable-window ${classNames}`}
  class:show = {show}
  style={computedStyle}
  role="presentation"
  onmousedown={() => setToTop(windowElementId)}
>
  {@render header?.()}
  <main class="content">
    {@render children?.()}
  </main>
  <div class="resize-handle top"></div>
  <div class="resize-handle right"></div>
  <div class="resize-handle bottom"></div>
  <div class="resize-handle left"></div>
  <div class="resize-handle top-left"></div>
  <div class="resize-handle top-right"></div>
  <div class="resize-handle bottom-left"></div>
  <div class="resize-handle bottom-right"></div>

</div>

<style>
.resizable-window {
  --min-size: 100px;

  position: absolute;
  top: 50%;
  left: 50%;
  min-width: max(1vw, var(--min-size));
  min-height: max(1vh, var(--min-size));;
  display: flex;
  flex-direction: column;
  border: 3px solid #aaa;
  border-radius: 5px;
  background-color: #f0f0f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.resizable-window:not(.show) {
  display: none;
}

.resizable-window .title-bar {
  display: flex;
  flex-basis: 32px;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 32px;

  background: linear-gradient(to bottom, #a8d4ee, #96a9c5);
  border-bottom: 1px solid #a0a0a0;
}

.resizable-window .title-bar .title {
  flex: 1 1 auto;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  color: #333;
  margin: 0;
  padding: 0 5px;

  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
  user-select: none;
}

.resizable-window .buttons {
  display: flex;
  flex: 0 0 auto;
  flex-direction: row;
}

.resizable-window .buttons button {
  top: 2px;
  right: 12px;
  width: 32px;
  height: 30px;
  border: none;
  border-radius: 3px;
  color: #333;
  background-color: transparent;
  font-family: monospace;
  font-weight: bold;
  font-size: 14px;
  letter-spacing: 1px;
  text-align: center;
  margin: 0;
  padding: 0 4px;

  --icon-color: #333;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #f03a3a;
    --icon-color: #000;
  }
}

.resizable-window .content {
  display: block;
  width: 100%;
  height: 100%;
  contain: strict;
  content-visibility: auto;
  overflow: hidden;
}

/* Resize handles */
.resizable-window .resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: transparent;
  z-index: 102;
  user-select: none;

  --gutter-size: 10px;
}

.resizable-window .resize-handle.top {
  top: calc(var(--gutter-size) * -0.5);
  left: 0;
  width: 100%;
  height: var(--gutter-size);
  cursor: n-resize;
  z-index: 103;
}

.resizable-window .resize-handle.right {
  right: calc(var(--gutter-size) * -0.5);
  top: 0;
  width: var(--gutter-size);
  height: 100%;
  cursor: e-resize;
  z-index: 103;
}

.resizable-window .resize-handle.bottom {
  bottom: calc(var(--gutter-size) * -0.5);
  left: 0;
  width: 100%;
  height: var(--gutter-size);
  cursor: s-resize;
  z-index: 103;
}

.resizable-window .resize-handle.left {
  left: calc(var(--gutter-size) * -0.5);
  top: 0;
  width: var(--gutter-size);
  height: 100%;
  cursor: w-resize;
  z-index: 103;
}

.resizable-window .resize-handle.top-right {
  top: calc(var(--gutter-size) * -0.5);
  right: calc(var(--gutter-size) * -0.5);
  width: var(--gutter-size);
  height: var(--gutter-size);
  cursor: ne-resize;
  z-index: 104;
}

.resizable-window .resize-handle.bottom-right {
  bottom: calc(var(--gutter-size) * -0.5);
  right: calc(var(--gutter-size) * -0.5);
  width: var(--gutter-size);
  height: var(--gutter-size);
  cursor: se-resize;
  z-index: 104;
}

.resizable-window .resize-handle.bottom-left {
  bottom: calc(var(--gutter-size) * -0.5);
  left: calc(var(--gutter-size) * -0.5);
  width: var(--gutter-size);
  height: var(--gutter-size);
  cursor: sw-resize;
  z-index: 104;
}

.resizable-window .resize-handle.top-left {
  top: -5px;
  left: -5px;
  width: var(--gutter-size);
  height: var(--gutter-size);
  cursor: nw-resize;
  z-index: 104;
}
</style>