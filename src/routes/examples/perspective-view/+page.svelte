<script lang="ts">
  import { onMount } from 'svelte';
  import PerspectiveView from '$lib/perspective-view/PerspectiveView.svelte';
  import Layers from '$lib/layers/Layers.svelte';

  const testImg = 'https://images.mirma.cc/whereiswally.jpg';

  let layerProps = $state({ width: 0, height: 0 });
  const onViewportDimChanged = (event) => {
    layerProps.width = event.width;
    layerProps.height = event.height;
  };

  let layerWidth = $state(0);
  let layerHeight = $state(0);

  const onCanvasEventBroadcast = (event) => {
    console.log(event);
    items.forEach((item) => {
      item.execCommand(event);
    });
  };

  const onAddNewLayer = (event) => {
    const { detail } = event.detail;
    const payload = detail?.payload;

    console.log(event);
    items.push({
      type: 'div',
      content: `<h1>Hi my name is</h1>`,
      text: '3',
      execCommand: (event) => {},
    });
  };
</script>

<h1>Pan and Zoom</h1>
<div class="layer-container">
  <PerspectiveView
    onViewportDimChanged={onViewportDimChanged}
    bind:width={layerWidth}
    bind:height={layerHeight}
  >
    <div class="layer">
      <picture>
        <source srcset={testImg} />
        <img src="https://images.mirma.cc/4430563_Fuf_egguhuntib.png" alt="Where's Walley?" />
      </picture>
    </div>
  </PerspectiveView>
</div>

<section class="description">
  <h4>Description</h4>
  <p>Pan: Hold Space and Drag</p>
  <p>Zoom: Scroll</p>
</section>

<section class="image-info">
  <p>widht: {layerProps.width}</p>
  <p>height: {layerProps.height}</p>
  <p>width: {layerWidth}</p>
  <p>height: {layerHeight}</p>
</section>

<style>
  .layer-container {
    width: 100%;
    height: 600px;
    border: 1px solid black;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .description {
    margin-top: 1em;
    padding: 0 1em;
    border: 1px solid black;
  }

  .image-info {
    margin-top: 1em;
    padding: 0 1em;
    border: 1px solid black;
  }
</style>
