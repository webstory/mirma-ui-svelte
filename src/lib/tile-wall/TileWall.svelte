<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    tileWidth = 200,
    tileHeight = 200,
    panels = [],
    template,
  } : {
    tileWidth: number,
    tileHeight: number,
    panels: Snippet[],
    template: (props: any) => Snippet
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
  {#each panels as props, idx (props?.id ?? idx)}
    <div class="tile">
      {@render template(props)}
    </div>
  {/each}
</div>

<style>
  .tile-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--width), 1fr));
    gap: 1rem;

    --width: 200px;
    --height: 200px;
  }

  .tile {
    position: relative;
    width: var(--width);
    height: var(--height);
    border: none;
    border-radius: 5px;
    overflow: hidden;
  }
</style>