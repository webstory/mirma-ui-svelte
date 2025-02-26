<script module lang="ts">
  const SUPPORT_TOUCH = 'ontouchstart' in window;
  const EVENTS = {
    start: SUPPORT_TOUCH ? 'touchstart' : 'mousedown',
    move: SUPPORT_TOUCH ? 'touchmove' : 'mousemove',
    end: SUPPORT_TOUCH ? 'touchend' : 'mouseup',
  };

  const CANVASWIDTH = 960;
  const CANVASHEIGHT = 512;
</script>

<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import {
    fromEvent,

    map,
    switchMap,
    filter,
    scan,
    share,
    takeUntil,
    throttleTime,
    distinctUntilChanged,
  } from 'rxjs';

  export interface BrushProperty {
    color: string;
    size: number;
    opacity: number;
  }

  export const defaultBrushStyle: BrushProperty = {
    color: '#ff0000',
    size: 10,
    opacity: 1,
  };

  let {
    brush,

    onCanvasUpdate = () => {},
    onStroke = () => {},
  } : {
    brush: BrushProperty,

    onCanvasUpdate?: (event: { tiles: TileBitmap[] }) => void,
  } = $props();

  brush = {...defaultBrushStyle, ...brush};

  let canvas: HTMLCanvasElement;
  let animationFrameId;

  function toPos(event: MouseEvent | TouchEvent): {x: number, y: number, z?: number, pressure?: number} {
    let clientX = 0;
    let clientY = 0;

    if (SUPPORT_TOUCH) {
      const touch = (event as TouchEvent).changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      const mouse = event as MouseEvent;
      clientX = mouse.clientX;
      clientY = mouse.clientY;
    }

    // 캔버스의 실제 좌표로 변환
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((clientX - rect.left) * scaleX);
    const y = Math.round((clientY - rect.top) * scaleY);
    const z = (event as WheelEvent).deltaY || 0;
    const pressure = (event as PointerEvent).pressure || 0.5;

    return { x, y, z, pressure };
  }

  function drawLine(s, e) {
    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(e.x, e.y);
    ctx.strokeStyle = brush.color;
    ctx.globalAlpha = brush.opacity;
    ctx.lineCap = 'round';
    ctx.lineWidth = brush.size * e.pressure;
    ctx.stroke();
  }


  onMount(() => {
    canvas.width = CANVASWIDTH;
    canvas.height = CANVASHEIGHT;

    const pointerMove$ = fromEvent(canvas, EVENTS.start)
      .pipe(
        filter((event) => (event as MouseEvent).button === 0),
        map(toPos),
        switchMap((startPos) => fromEvent(canvas, EVENTS.move)
          .pipe(
            map(toPos),
            takeUntil(fromEvent(window, EVENTS.end)),
            distinctUntilChanged((a, b) => (
              Math.abs(a.x - b.x) < 1 &&
              Math.abs(a.y - b.y) < 1
            )),
            throttleTime(16),
            scan((acc, pos) => {
              return {
                s: acc.e,
                e: pos
              };
            }, {
              s: startPos,
              e: startPos,
            }),
            share(),
          ),
        ),
      );

    const drawSub = pointerMove$.subscribe(({ s, e }) => {
      drawLine(s, e);
    });

    const emitSub = pointerMove$.subscribe(({ s, e }) => {
      onStroke({ type:'line', s, e });
    });

    return (() => {
      drawSub.unsubscribe();
      emitSub.unsubscribe();
      // cancelAnimationFrame(animationFrameId);
    });
  });

  export function clear() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  export function getImage() {
    return canvas.toDataURL('image/png');
  }
</script>

<style>
  canvas {
    width: 100%;
    height: 100%;
    /* 내부 해상도(960×540)와 화면 표시 크기 간의 픽셀 부정확성을 줄이기 위해
       image-rendering: pixelated; 를 사용할 수 있음. */
    image-rendering: pixelated;
  }
</style>

<canvas bind:this={canvas}></canvas>
