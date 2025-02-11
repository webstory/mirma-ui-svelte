<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';

  export interface DimChangedEvent {
    width: number;
    height: number;
  }

  let {
    children,
    fixed,

    width,
    height,
    keyBindings = {
      pan: ' ',
    },

    onViewportDimChanged = () => {},
    onZoom = () => {},
    onCanvasEvent = () => {},
  } : {
    children: Snippet;
    fixed: Snippet;

    width: number;
    height: number;
    keyBindings: {
      pan: string;
    };

    onViewportDimChanged: (event: DimChangedEvent) => void;
    onZoom: (event: { scale: number }) => void;
    onCanvasEvent: (event: { type: string; detail: any }) => void;
  } = $props();

  let previousTouchAction;
  onMount(() => {
    previousTouchAction = document.body.style.touchAction;
    document.body.style.touchAction = 'none';
  });

  onDestroy(() => {
    document.body.style.touchAction = previousTouchAction;
  });

  type KeyBindings = typeof keyBindings;

  const propsInner = $derived.by(() => ({
    width,
    height,
  }));

  let oldWidth = 0;
  let oldHeight = 0;

  $effect(() => {
    if (oldWidth !== width || oldHeight !== height) {
      oldWidth = width;
      oldHeight = height;
      onViewportDimChanged({ width, height });
    }
  })

  type BroadcastEvent = MouseEvent | KeyboardEvent | PointerEvent;

  const broadcast = (eventName: string, event: BroadcastEvent) => {
    const ev = { detail: event.detail, type: eventName };
    if (/^mouse/.test(eventName)) {
      ev.detail = {
        ...event.detail,
        clientX: event.clientX,
        clientY: event.clientY,
        offsetX: event.offsetX,
        offsetY: event.offsetY,
        pageX: event.pageX,
        pageY: event.pageY,
        screenX: event.screenX,
        screenY: event.screenY,
      };
    } else if (/^key/.test(eventName)) {
      ev.detail = {
        ...event.detail,
        key: event.key,
        code: event.code,
        location: event.location,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
        repeat: event.repeat,
        isComposing: event.isComposing,
        charCode: event.charCode,
        keyCode: event.keyCode,
        which: event.which,
      };
    } else if (/^pointer/.test(eventName)) {
      ev.detail = {
        ...event.detail,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        pressure: event.pressure,
        tangentialPressure: event.tangentialPressure,
        tiltX: event.tiltX,
        tiltY: event.tiltY,
        twist: event.twist,
        width: event.width,
        height: event.height,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        isPrimary: event.isPrimary,
      };
    }
    onCanvasEvent(ev);
  };

  interface PointerState {
    hover: boolean;
    mode: 'default' | 'pan' | 'zoom' | 'rotate';
    cursor: 'default' | 'grab' | 'grabbing';
    panning: boolean;
    current: [number, number];
    anchor: [number, number];
    delta: [number, number];
  }

  // pointerState as PointerState
  let pointerState: PointerState = $state({
    // Current state
    hover: false,
    mode: 'default',
    cursor: 'default',
    panning: false,

    // Cursor position
    current: [0, 0],
    anchor: [0, 0],
    delta: [0, 0],
  });

  let containerState = $state({
    pan: [0, 0],
    scale: 1.0,
  });

  let containerTransform = $state('');

  const handlePointerEnter = () => {
    pointerState.hover = true;
  };

  const handlePointerLeave = () => {
    pointerState.hover = false;
  };

  const handlePointerMove = (event) => {
    // Get current cursor position
    const { clientX, clientY } = event;
    pointerState.current = [clientX, clientY];
    pointerState.delta = [clientX - pointerState.anchor[0], clientY - pointerState.anchor[1]];

    // log pointerState
    // console.log(JSON.stringify(pointerState));
    if (pointerState.panning === true) {
      // Adjust panning distance by container scale factor
      const pan = [containerState.pan[0] + pointerState.delta[0] / containerState.scale, containerState.pan[1] + pointerState.delta[1] / containerState.scale];
      containerTransform = `translate3d(${pan[0]}px, ${pan[1]}px, 0)`;
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (pointerState.hover === false) return;
    if (event.key) {
      event.preventDefault();
      event.stopPropagation();
      // dispatch('escape');
      console.log(`[Keydown] ${event.key}`);

      switch (event.key as KeyBindings) {
        case keyBindings.pan:
          if (pointerState.mode === 'pan') return;
          pointerState.mode = 'pan';
          pointerState.cursor = 'grab';
          break;
      }
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key as KeyBindings) {
      case keyBindings.pan:
        pointerState.mode = 'default';
        pointerState.cursor = 'default';
        pointerState.panning = false;
        break;
    }
  };

  const handlePointerDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { pointerType } = event;
    if (pointerType === 'mouse') {
      // Mouse
      const button = event.button;
      if (button === 0 && pointerState.mode === 'pan' && pointerState.hover === true) {
        // Left click
        pointerState.panning = true;
        pointerState.cursor = 'grabbing';
        pointerState.anchor = [...pointerState.current];
      }
    } else if (pointerType === 'touch') {
      // Touch
    } else if (pointerType === 'pen') {
      // Pen
      if (event.buttons === 1 && pointerState.mode === 'pan' && pointerState.hover === true) {
        pointerState.panning = true;
        pointerState.cursor = 'grabbing';
        pointerState.anchor = [...pointerState.current];
      }
    }
  };

  const handlePointerUp = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { pointerType } = event;
    if (pointerType === 'mouse') {
      // Mouse
      const button = event.button;
      if (button === 0 && pointerState.mode === 'pan' && pointerState.panning === true) {
        pointerState.panning = false;
        pointerState.cursor = 'grab';
        const pan = [
          containerState.pan[0] + pointerState.delta[0] / containerState.scale,
          containerState.pan[1] + pointerState.delta[1] / containerState.scale,
        ];

        containerState.pan = pan;
      }
    } else if (pointerType === 'touch') {
      // Touch
    } else if (pointerType === 'pen') {
      // Pen
      if (event.buttons === 0 && pointerState.mode === 'pan' && pointerState.panning === true) {
        pointerState.panning = false;
        pointerState.cursor = 'grab';
        const pan = [
          containerState.pan[0] + pointerState.delta[0] / containerState.scale,
          containerState.pan[1] + pointerState.delta[1] / containerState.scale,
        ];

        containerState.pan = pan;
      }
    }
  };

  const handleMouseWheel = (event) => {
    if (pointerState.hover === false) return;
    event.preventDefault();
    event.stopPropagation();
    const { deltaY } = event;
    if (deltaY < 0) {
      // Zoom in
      containerState.scale = containerState.scale * 1.1;
      dispatch('zoom', { scale: containerState.scale });
    } else {
      // Zoom out
      containerState.scale = containerState.scale * 0.9;
      dispatch('zoom', { scale: containerState.scale });
    }
  };
</script>

<svelte:body
  onkeydown={handleKeyDown}
  onkeyup={handleKeyUp}
  onpointermove={handlePointerMove}
  onpointerdown={handlePointerDown}
  onpointerup={handlePointerUp}
/>

<div
  class="container"
  bind:clientWidth={width}
  bind:clientHeight={height}
  onpointerover={handlePointerEnter}
  onpointerout={handlePointerLeave}
  onwheel={handleMouseWheel}
  style:cursor={pointerState.cursor}
>
  <!-- Image viewport controller container -->
  <div
    class="viewport"
    style:transform={containerTransform}
    style:scale={containerState.scale}
    style:pointer-events={pointerState.mode === 'default' ? 'all' : 'none'}
  >
    {@render children?.(propsInner)}
  </div>
  <!-- Fixed container -->
  {@render fixed?.(propsInner)}
</div>

<style>
  .container {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;

    overflow: hidden;
    contain: strict;

    touch-action: none;
  }

  .viewport {
    position: relative;
    width: 100%;
    height: 100%;

    transition: scale 0.2s ease-out;
  }

  .container :global(.wp-layer) {
    &:first-child {
      position: relative;
    }
    &:not(:first-child) {
      position: absolute;
    }
    top: 0;
    left: 0;
    box-sizing: border-box;
    resize: none;
    overflow: visible;

    width: 100%;
    height: 100%;
  }
</style>
