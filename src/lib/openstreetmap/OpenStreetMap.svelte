<script lang="ts">
  export const ssr = false;

  import { onMount } from "svelte";
  import L, { marker } from 'leaflet';
  import 'leaflet/dist/leaflet.css';

  let map = $state<L.Map|null>(null);
  let mapElement: HTMLDivElement;

  // Set korea seoul station coordinate
  let center = $state([
    37.5535,
    126.9698
  ]);

  let zoom = $state(14);

  let markers = $state([
    { lat: 37.5535, lon: 126.9698, title: '서울역' },
    { lat: 37.5405, lon: 126.9708, title: '남영역' },
  ]);

  const markerIds = new Map();

  $effect(() => {
    if(map) {
      // Add new markers
      markers.forEach((marker) => {
        const markerId = marker.id ?? marker.title;
        if(!markerIds.has(markerId)) {
          const newMarker = L.marker([marker.lat, marker.lon || marker.lng]).addTo(map);
          markerIds.set(markerId, newMarker);
        }
        L.marker([marker.lat, marker.lon]).addTo(map)
      });

      // Remove deleted markers
      markerIds.forEach((marker, markerId) => {
        if(!markers.find((marker) => (
          marker.id === markerId ||
          (!marker.id && marker.title === markerId)
        ))) {
          map.removeLayer(marker);
          markerIds.delete(markerId);
        }
      });
    }
  })

  onMount(() => {
    map = L.map(mapElement).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
  });
</script>

<div class="openstreetmap" bind:this={mapElement}></div>

<style>
  .openstreetmap {
    position: static;
    width: 100%;
    height: 100%;
    min-height: 500px;
  }
</style>