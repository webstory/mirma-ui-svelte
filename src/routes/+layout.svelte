<script>
  let listItems = [
    { url: '/examples/lazy-image', text: "Lazy Images"},
    { url: '/examples/layers', text: 'Layers' },
    { url: '/examples/audio', text: 'Audio' },
    { url: '/examples/tile-wall', text: 'Tiled Layout' },
    { url: '/examples/perspective-view', text: 'Pan and Zoom'},
    { url: '/examples/toast', text: 'Toast!'},
  ]
</script>

<div class="container">
  <aside>
    <ul>
      {#each listItems as { url, text }}
        <li>
          <a href={url}>{text}</a>
        </li>
      {/each}
    </ul>
  </aside>
  <main>
    <slot />
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

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin: 0.5em 0;
  }

  a {
    text-decoration: none;
    color: hsl(208, 77%, 47%);
  }
</style>