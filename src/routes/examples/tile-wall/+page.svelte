<script lang="ts">
  import ResizableWindow from '$lib/resizable-window/ResizableWindow.svelte';
  import TileWall from '$lib/tile-wall/TileWall.svelte';

  import { toStyle } from '$lib/utils';

  const panels = $state([
    ['https://picsum.photos/id/10/200/300', 'a'],
    ['https://picsum.photos/id/20/200/300', 'b'],
    ['https://picsum.photos/id/30/200/300', 'c'],
    ['https://picsum.photos/id/40/200/300', 'd'],
    ['https://picsum.photos/id/50/200/300', 'e'],
  ]);

  let tileWidth = $state(200);
  let tileHeight = $derived(Math.round(tileWidth * 300 / 200));

  function addTile() {
    const id = String.fromCharCode(panels.length + 97);
    panels.push([`https://picsum.photos/id/${(panels.length + 1) * 10}/200/300`, id]);
  }

</script>

<div class="tile-container">
  <ResizableWindow
    show={true}
    style={toStyle({ position: 'absolute', top: '150px', left: '150px', width: '800px', height: '400px' })}
    title="Resizable Window"
    onClose={() => {}}
  >
    <TileWall
      {tileWidth}
      {tileHeight}
      {panels}
    >
      {#snippet template(props)}
        <div class="tile" style="background-image: url({props[0]})">
          <div class="tile-content">
            <div class="tile-title">{props[1]}</div>
          </div>
        </div>
      {/snippet}
    </TileWall>
  </ResizableWindow>
</div>

<section class="control-panel">
  <button onclick={addTile}>Add Tile</button>
  <div class="row">
    <label for="tileWidth">Tile Width</label>
    <input name="tileWidth" type="range" min="200" max="1920" bind:value={tileWidth} />
  </div>
</section>


<style>
  .tile-container {
    width: 100%;
    height: 100%;
    gap: 1rem;
  }

  .tile {
    position: relative;
    height: 100%;
    background-size: cover;
    background-position: center;
    border-radius: 5px;
    overflow: hidden;
  }

  .tile-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.5);
    color: white;
  }

  .tile-title {
    font-size: 1.5rem;
    font-weight: bold;
  }

  button {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 0.5rem 1rem;
    background-color: blue;
    color: white;

    &:hover {
      background-color: darkblue;
    }
  }

  .control-panel {
    position: fixed;
    z-index: 100;
    top: 20px;
    right: 30px;
    opacity: 0.6;
    border: 2px solid #ccc;
    border-radius: 5px;
    background-color: white;

    width: 300px;
    height: 100px;
    padding: 10px;
  }
</style>