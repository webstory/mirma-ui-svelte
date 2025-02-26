<script lang="ts">
  import { onMount } from 'svelte';
  import Whiteboard from '$lib/whiteboard/Whiteboard.svelte';

  let whiteboard: Whiteboard;
  let performance = $state({ hashCalculationTime: 0 });
  let hashes = $state([]);
  let updatedTile = $state({ x: 0, y: 0 });
  let tileObjectUrl = $state('');
  let sync = $state(true);

  let whiteboard2: Whiteboard;

  function clear() {
    whiteboard.clear();
  }

  function handleCanvasDraw(event) {
    console.log(event);
    if(sync) whiteboard2?.draw(event);
  }

  function cloneWhiteboard() {
    const dataURL = whiteboard.toDataURL();
    console.log("DataURL length: ", dataURL.length);
    whiteboard2?.clear();
    whiteboard2?.draw({
      type: 'image',
      src: dataURL,
    });
  }



</script>

<h1>Whiteboard</h1>

<div class="container">
  <aside class="toolbar">
    <button onclick={clear}>Clear</button>
    <label>
      <input type="checkbox" bind:checked={sync} />
      Sync
    </label>
    <button onclick={cloneWhiteboard}>Clone</button>
  </aside>
  <main>
    <div class="panel">
    <h2>Main</h2>
    <Whiteboard bind:this={whiteboard}
      onDraw={handleCanvasDraw}
    />
    </div>
    <div class="panel">
    <h2>Cloned</h2>
    <Whiteboard bind:this={whiteboard2} />
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

    &.toolbar {
      display: flex;
      flex-direction: column;
      gap: 1em;
    }
  }


  main {
    flex: 1 1 auto;
    padding: 1em;
  }

  .panel {
    width: 100%;
    max-width: 960px;
    height: 512px;
    border: 1px solid #000;
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