<script lang="ts">
  import LazyImage from '$lib/lazy-image/LazyImage.svelte';

  let images = [];

  for(let i=10; i<=200; i+=10) {
    images.push(`https://picsum.photos/id/${i}/200/400`);
  }

  const handleError = (event) => {
    console.log(event);
  };

  const handleImageLoadStart = (event) => {
    const { src, width, height } = event;
    console.log(`Image intersected: ${src} (${width}x${height})`);
  };

  const handleImageLoaded = (event) => {
    const { src, width, height, time } = event;
    console.log(`Image loaded: ${src} (${width}x${height}); Time taken: ${time}ms`);
  };


</script>

<h1>Lazy Images</h1>

<div class="wrapper">
  {#each images as image, index}
    <LazyImage
      src={image}
      width={200}
      height={400}
      onShowing={handleImageLoadStart}
      onLoad={handleImageLoaded}
      onError={handleError}
    />
  {/each}
</div>