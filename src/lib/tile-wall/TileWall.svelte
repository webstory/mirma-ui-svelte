<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    tileWidth = 200,
    tileHeight = 200,

    children,
  } : {
    tileWidth: number,
    tileHeight: number,

    children?: Snippet,
  } = $props();

  let container: HTMLDivElement | null = null;

  $effect(() => {
    if(container) {
      container.style.setProperty('--width', `${tileWidth}px`);
      container.style.setProperty('--height', `${tileHeight}px`);
    }
  });

</script>

<div class="tile-container" bind:this={container}>
  {@render children?.()}
</div>

<style>
  .tile-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, var(--width));
    grid-auto-rows: var(--height);
    gap: 1rem;

    --width: 200px;
    --height: 200px;
  }
</style>