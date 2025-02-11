<script lang="ts">
  import { onMount } from 'svelte';

  import { setToastState, getToastState } from '$lib/toast/toast-state.svelte';
  import Toaster from '$lib/toast/Toaster.svelte';
  import ResizableWindow from '$lib/resizable-window/ResizableWindow.svelte';
  import Carousel from '$lib/carousel/Carousel.svelte';

  import { toStyle } from '$lib/utils';

  setToastState();
  const toastState = getToastState();

  let title = $state('');
  let message = $state('');
  let titleInput = $state<HTMLInputElement | null>(null);
  let dialogOpened = $state(true);


  const btnPrimaryClass = "text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800";
  const btnSecondaryClass = "text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800";


  const panels = [
    ['https://picsum.photos/id/10/200/300', 'a'],
    ['https://picsum.photos/id/20/200/300', 'b'],
    ['https://picsum.photos/id/30/200/300', 'c'],
    ['https://picsum.photos/id/40/200/300', 'd'],
    ['https://picsum.photos/id/50/200/300', 'e'],
  ];

</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<h1>Hello</h1>
<Toaster />

<div>
  <form
    onsubmit={(e) => {
      e.preventDefault();
      toastState.add(title, message);
      title = '';
      message = '';
      titleInput?.focus();
    }}

    class="toaster-form"
  >
    <div class="flex flex-col gap-1">
      <label for="title">Title</label>
      <input
        type="text"
        id="title"
        class="rounded-md border border-gray-800"
        bind:value={title}
        bind:this={titleInput}
        />
    </div>

    <div class="flex flex-col gap-1">
      <label for="message">Message</label>
      <input
        type="text"
        id="message"
        class="rounded-md border border-gray-800"
        bind:value={message}
        />
    </div>

    <button class="rounded-md bg-gray-300 p-1"> Add toast! </button>
  </form>
</div>

<ResizableWindow
  show={dialogOpened}
  style={toStyle({
    position: 'absolute',
    top: '50%',
    left: '50%',
    width : '400px',
    height: '400px',
    })}
  title="Resizable Window"
  onClose={() => dialogOpened = false}
  >
  <div>
    <p>Content</p>
  </div>
</ResizableWindow>

<ResizableWindow
  show={true}
  style={toStyle({
    position: 'absolute',
    top: '300px',
    left: '1000px',
    width : '400px',
    height: '400px',
    })}
  title="Resizable Window2"
  onClose={() => dialogOpened = false}
  >
  <div>
    <p>Content</p>
  </div>
</ResizableWindow>

<button onclick={() => dialogOpened = true}>Open Dialog</button>

{#snippet carouselPanel(imgSrc)}
  <img src={imgSrc} alt="" />
{/snippet}

<div class="carousel">
  <h2>Carousel</h2>
  <Carousel {panels}>
    {#snippet panelTemplate(args)}
      {@const [imgSrc, alt] = args}
      <img src={imgSrc} alt={alt} />
    {/snippet}
  </Carousel>
</div>


<style>
  button {
    padding: 0.5rem 1rem;
    border-radius: 5px;
    border: 2px solid black;
    cursor: pointer;
  }
  .toaster-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 400px;
    border: 1px solid black;
    border-radius: 5px;
    padding: 1rem;
  }

  .carousel {
    width: 200px;
    height: 300px;
    margin-left: 30vw;
  }
</style>