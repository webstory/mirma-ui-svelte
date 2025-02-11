<script lang="ts">
  import { onMount } from 'svelte';

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'ico', 'webp', 'avif'];

  let canvas: HTMLCanvasElement;
  $: width = 1;
  $: height = 1;

  onMount(() => {});

  /* Image loader for CORS workaround */
  let img: HTMLImageElement;
  const handleImgLoaded = (event) => {
    const ctx = canvas.getContext('2d');
    width = img.width;
    height = img.height;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0);
    // Clear img.src for the next drop
    img.src = '';
  };

  // Explain to user why the image is not loaded
  const handleImgLoadError = (event) => {
    console.error('Failed to load image', event);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('dragenter');
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('dragleave');
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('dragover');
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('drop', event);

    // If it is an image, then get a image data as an array buffer
    const files = event.dataTransfer.files;
    console.log('files', files);
    if (files.length > 0) {
      const file = files[0];
      const { name, lastModified, size, type } = file;
      console.log('file', name, lastModified, size, type);

      // read file content as base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        img.src = base64;
      };
      reader.readAsDataURL(file);
    }

    // If it is a url, then fetch the url and draw it on the canvas
    const urls = event.dataTransfer.getData('text/uri-list');
    const url = urls instanceof Array ? urls[0] : urls;
    if (url) {
      const filename = new URL(url).pathname.split('/').pop();
      // Guess this url is an image by checking the extension
      const ext = filename.split('.').pop();
      if (imageExtensions.includes(ext)) {
        img.src = url;
      }
    }
  };

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('click');
  };
</script>

<div
  class={$$restProps.class ?? ''}
  {width}
  {height}
  on:dragenter={handleDragEnter}
  on:dragleave={handleDragLeave}
  on:dragover={handleDragOver}
  on:drop={handleDrop}
  on:click={handleClick}
>
  <slot />
  <canvas class="debug border-red" bind:this={canvas} />
  <img class="hidden" bind:this={img} on:load={handleImgLoaded} on:error={handleImgLoadError} />
</div>

<style>
  .hidden {
    visibility: hidden;
    position: absolute;
    pointer-events: none;
  }
</style>
