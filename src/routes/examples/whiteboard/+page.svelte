<script lang="ts">
  import { onMount } from 'svelte';
  import Whiteboard from '$lib/whiteboard/Whiteboard.svelte';

  let whiteboard: Whiteboard;
  let performance = $state({ hashCalculationTime: 0 });
  let hashes = $state([]);
  let updatedTile = $state({ x: 0, y: 0 });
  let tileObjectUrl = $state('');

  function clear() {
    whiteboard.clear();
  }

  function handleCanvasHash(event) {
    const { hashes: _hashes, elapsed } = event;
    performance.hashCalculationTime = elapsed;
    hashes = _hashes;
  }

  function handleCanvasUpdate(event) {
    const { tiles } = event;
    updatedTile.x = tiles[0].x;
    updatedTile.y = tiles[0].y;
    tileObjectUrl = tiles[0].data;
  }

  function handleCanvasStroke(event) {
    console.log(event);
  }
</script>

<h1>Whiteboard</h1>

<div class="container">
  <aside>
    <button onclick={clear}>Clear</button>
    <div>
      <h4>Performance</h4>
      <p>Hash calculation time: {performance.hashCalculationTime.toFixed(2)} ms</p>
      <div class="updated-tiles">
        <h4>Updated tiles</h4>
        <pre>{updatedTile.x} / {updatedTile.y}</pre>
        <img src={tileObjectUrl} alt="Tile object" />
        <p>Chunk size: {tileObjectUrl.length}</p>
        <textarea readonly>DataURL: {tileObjectUrl}</textarea>
      </div>
    </div>
  </aside>
  <main>
    <Whiteboard bind:this={whiteboard}
      onCanvasUpdate={handleCanvasUpdate}
      onStroke={handleCanvasStroke}
    />
    <div class="float-dock">
      <h4>Hash array</h4>
      <div class="hash-map">
        {#each hashes as { level, x, y, width, height, hash }}
          <div
            style:position="absolute"
            style:z-ndex={level}
            style:left={x + 'px'}
            style:top={y + 'px'}
            style:width={width + 'px'}
            style:height={height + 'px'}
            style:font-size={Math.floor(12 / level) + 'em'}
            style:border="1px solid black">
            <span>{hash}</span>
          </div>
        {/each}

      </div>
    </div>
  </main>
</div>

<style>
  .container {
    display: flex;
    justify-content: space-between;
    margin: 1em;
  }

  aside {
    flex: 0 1 auto;
    width: 200px;
    padding: 1em;
    background: hsl(0, 0%, 95%);
  }

  main {
    flex: 1 1 auto;
    padding: 1em;
  }

  .float-dock {
    display: none;

    position: fixed;
    top: 0;
    right: 0;
    width: 300px;
    height: 100vh;
    padding: 1em;
    background: hsl(0, 0%, 95%);
    overflow-y: auto;
    font-size: 3px;

    pre {
      width: 100%;
      min-height: 100%;
    }
  }

  .hash-map {
    position: relative;
    width: 100%;
    height: 100%;

    div {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

</style>