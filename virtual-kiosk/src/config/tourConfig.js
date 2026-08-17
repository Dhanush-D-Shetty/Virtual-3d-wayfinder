import kioskData from './kioskData.json'

/**
 * Dynamically construct Photo Sphere Tour Nodes from kioskData.json
 */
export const tourNodes = kioskData.scenes.map((scene) => {
  // Find all stores belonging to this room scene
  const sceneStores = kioskData.stores.filter((store) => store.nodeId === scene.id)

  const markers = sceneStores.map((store) => ({
    id: store.id,
    position: store.position,
    html: `
      <div class="custom-tag">
        <!-- Floating Glass Store Badge -->
        <div class="marker-card">
          <span class="tag-badge badge-${store.badgeColor || 'cyan'}">${store.category}</span>
          <p class="tag-title">${store.name}</p>
          <span class="tap-hint">Tap to Inspect & Listen</span>
        </div>

        <!-- Animated Bouncing Green Location Arrow Pin -->
        <div class="bouncing-green-arrow">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v14"/>
            <path d="m19 11-7 7-7-7"/>
          </svg>
        </div>

        <!-- Ground Pulse Spot -->
        <div class="ground-pulse-ring"></div>
      </div>
    `,
    tooltip: `Click to open ${store.name}`,
    data: store,
    anchor: 'bottom center'
  }))

  return {
    id: scene.id,
    panorama: scene.panorama,
    name: scene.name,
    mapCoords: scene.mapCoords,
    links: scene.links,
    markers
  }
})

export const defaultViewerOptions = {
  navbar: ['autorotate', 'zoom', 'fullscreen'],
  autorotateSpeed: '1rpm',
  autorotateDelay: 5000,
  autorotatePitch: -0.1,
  defaultPitch: -0.1,
  startNodeId: 'node-1'
}

export { kioskData }
