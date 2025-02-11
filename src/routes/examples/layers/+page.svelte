<script lang="ts">
  import Layers from '$lib/layers/Layers.svelte';

  let activeButtonLayer = $state(false);
</script>

<div class="container">
  <Layers
    class="border"
  >
    <div class="layer active">
      <!-- svelte-ignore a11y_media_has_caption -->
      <video
        width="100%"
        controls
        controlsList="nodownload nofullscreen"
        playsinline
        autoplay
        muted
        loop
        preload="auto"
      >
        <source src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4" type="video/mp4">
        <!-- <track kind="captions" src="/mock/video.vtt" srclang="en" label="English"> -->
      </video>
    </div>
    {#each Array(5) as _, i}
      <div class="layer">
        <img src={`https://picsum.photos/id/${10+i*3}/200/300`} alt="" style={`margin-left:${i*100}px; margin-top:${i*10}px`}/>
      </div>
    {/each}
    <div class="layer" class:active={activeButtonLayer}>
      <button class="big-blue-button" onclick={()=>alert("clicked")}>Click me</button>
    </div>
  </Layers>

  <button
    class="toggle-btn"
    onclick={()=>activeButtonLayer = !activeButtonLayer}
  >
    Toggle button layer active
  </button>
</div>

<style>
  .container {
    width: auto;
    height: auto;
  }

  .big-blue-button {
    position: absolute;
    top: 30%;
    left: 30%;
    background-color: #ccc;
    color: white;
    padding: 10px;
    border-radius: 5px;
    cursor: not-allowed;
  }

  .layer.active .big-blue-button {
    background-color: blue;
    cursor: pointer;
  }

  .toggle-btn {
    width: auto;
    height: 3em;
    background-color: rgb(178, 178, 255);
    border-radius: 5px;
    cursor: pointer;
  }
</style>