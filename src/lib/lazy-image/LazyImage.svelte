<script lang="ts">
  import { noop } from 'rxjs';
  import { onMount, tick } from 'svelte';
  import type { Snippet } from 'svelte';

  export interface LazyImageEvent {
    src: string;
    width: number;
    height: number;
    time?: number;
  }

  let {
    src,
    width: _w,
    height: _h,
    alt,

    onLoad = () => {},
    onShowing = () => {},
    onError = () => {},

    placeholder,
  } : {
    src: string,
    width: number;
    height: number;
    alt?: string;

    onLoad?: (event: LazyImageEvent) => void;
    onShowing?: (event: LazyImageEvent) => void;
    onError?: (e: Error) => void;

    placeholder?: Snippet;
  } = $props();

  let imgEl: HTMLImageElement;
  let imageLoaded = $state(false);
  let width = $state(0);
  let height = $state(1000);
  let fetchTime = $state(0);

  let getDimension = async () => {
    fetch(src, {
      method: 'HEAD',
      mode: 'no-cors',
    }).then((res) => {
      if (res.ok && imageLoaded === false) {
        if (res.headers?.get('X-Width') && res.headers?.get('X-Height')) {
          width = parseInt(res.headers.get('X-Width'));
          height = parseInt(res.headers.get('X-Height'));
        }
      } else {
        onerror(new Error('Failed to fetch image dimensions'));
      }
    });
  }

  if(_w) {
    width = _w;
    getDimension = noop;
  }

  if(_h) {
    height = _h;
    getDimension = noop;
  }

  onMount(async () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fetchTime = performance.now();
            onShowing({ src, width, height });
            imgEl.src = src;
            observer.unobserve(imgEl);
          }
        });
      },
      { threshold: 0.1 }
    );

    await tick().then(() => {
      observer.observe(imgEl);
    });

    return () => {
      observer.disconnect();
    };
  });

  function afterLoad() {
    imageLoaded = true;
    width = imgEl.naturalWidth;
    height = imgEl.naturalHeight;
    const t = performance.now();
    onLoad({ src, width, height, time: t - fetchTime });
  }
</script>

<div class="wrapper" style:width={width + 'px'} style:height={height + 'px'}>
  <img bind:this={imgEl} data-src={src} {alt} onload={afterLoad} />
  {#if !imageLoaded}
    <div class="placeholder">
      {@render placeholder?.()}
    </div>
  {/if}
</div>

<style>
  .wrapper {
    position: relative;
    overflow: hidden;
    min-height: 100px;
  }

  .wrapper * {
    box-sizing: border-box;
  }

  .wrapper img {
    position: relative;
    top: 0;
    left: 0;
  }

  .placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #eee;
    border: 1px solid #ccc;
  }
</style>
