import { ref, onUnmounted } from 'vue'
import { Viewer } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin'

import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import '@photo-sphere-viewer/virtual-tour-plugin/index.css'

import { tourNodes, defaultViewerOptions, kioskData } from '../config/tourConfig'
import { walkToNode } from '../utils/walkAnimation'
import { soundFx } from '../utils/soundEffects'

export function useVirtualTour() {
  let viewerInstance = null
  let virtualTourPlugin = null
  let markersPlugin = null

  // View state: 'home' (Home Landing Screen) or 'map' (360 Interactive Viewport)
  const currentView = ref('home')

  const currentSceneName = ref('Entrance Hall')
  const currentNodeId = ref('node-1')
  const selectedMarker = ref(null)
  const isAudioMuted = ref(false)
  const isLoaded = ref(false)

  // Developer coordinates picker state
  const lastClickedCoords = ref(null)

  // Directory drawer toggle state
  const isDirectoryOpen = ref(false)

  const initViewer = (containerElement) => {
    if (!containerElement) return

    viewerInstance = new Viewer({
      container: containerElement,
      navbar: defaultViewerOptions.navbar,
      autorotateSpeed: defaultViewerOptions.autorotateSpeed,
      autorotateDelay: defaultViewerOptions.autorotateDelay,
      autorotatePitch: defaultViewerOptions.autorotatePitch,
      defaultPitch: defaultViewerOptions.defaultPitch,
      plugins: [
        [MarkersPlugin],
        [
          VirtualTourPlugin,
          {
            renderMode: '3d',
            nodes: tourNodes,
            startNodeId: defaultViewerOptions.startNodeId
          }
        ]
      ]
    })

    virtualTourPlugin = viewerInstance.getPlugin(VirtualTourPlugin)
    markersPlugin = viewerInstance.getPlugin(MarkersPlugin)

    // Intercept marker click to show detail modal & READ NAME ALOUD
    markersPlugin.addEventListener('select-marker', ({ marker }) => {
      if (marker.data) {
        selectedMarker.value = marker.data
        soundFx.speakText(`Inspecting ${marker.data.name}. ${marker.data.description}`)
      }
    })

    // Intercept node selection to trigger human walk animation
    virtualTourPlugin.addEventListener('select-node', (e) => {
      e.preventDefault()

      const currentNode = virtualTourPlugin.getCurrentNode()
      const targetLink = currentNode.links?.find((l) => l.nodeId === e.nodeId)

      if (targetLink) {
        walkToNode(viewerInstance, virtualTourPlugin, e.nodeId, targetLink.position)
      } else {
        virtualTourPlugin.setCurrentNode(e.nodeId)
      }
    })

    // Update state on node change
    virtualTourPlugin.addEventListener('node-changed', ({ node }) => {
      currentSceneName.value = node.name
      currentNodeId.value = node.id
      soundFx.speakText(`Entering ${node.name}`)
    })

    // Developer Coordinate Picker: Log clicked pitch & yaw to console & toast
    viewerInstance.addEventListener('click', ({ data }) => {
      console.log(`🎯 Clicked position -> pitch: ${data.pitch.toFixed(2)}, yaw: ${data.yaw.toFixed(2)}`)
      lastClickedCoords.value = {
        pitch: parseFloat(data.pitch.toFixed(2)),
        yaw: parseFloat(data.yaw.toFixed(2))
      }
    })

    isLoaded.value = true
  }

  // Load a store from Home Page or Directory catalog
  const loadStore = async (store) => {
    // 1. Switch view mode to 360 Map
    currentView.value = 'map'

    // Give Vue DOM time to render canvas container if switching from Home Page
    setTimeout(async () => {
      if (!virtualTourPlugin || !viewerInstance) return

      soundFx.speakText(`Navigating to ${store.name}`)

      // 2. Switch room node if store is in a different scene
      if (store.nodeId !== currentNodeId.value) {
        await virtualTourPlugin.setCurrentNode(store.nodeId)
      }

      // 3. Swivel camera to center on store pitch & yaw
      try {
        await viewerInstance.animate({
          pitch: store.position.pitch,
          yaw: store.position.yaw,
          speed: 1200
        })
      } catch (err) {
        // Ignore animation override if interrupted
      }

      // 4. Open detail modal
      selectedMarker.value = store
    }, 100)
  }

  const teleportToNode = (nodeId) => {
    if (virtualTourPlugin && nodeId !== currentNodeId.value) {
      virtualTourPlugin.setCurrentNode(nodeId)
    }
  }

  const resetTour = () => {
    if (virtualTourPlugin) {
      soundFx.speakText('Resetting to Entrance Hall')
      virtualTourPlugin.setCurrentNode('node-1')
    }
  }

  const toggleAudio = () => {
    isAudioMuted.value = soundFx.toggleMute()
  }

  const toggleDirectory = () => {
    isDirectoryOpen.value = !isDirectoryOpen.value
  }

  const closeModal = () => {
    selectedMarker.value = null
  }

  const dismissCoords = () => {
    lastClickedCoords.value = null
  }

  const destroyViewer = () => {
    if (viewerInstance) {
      viewerInstance.destroy()
      viewerInstance = null
      virtualTourPlugin = null
      markersPlugin = null
      isLoaded.value = false
    }
  }

  onUnmounted(() => {
    destroyViewer()
  })

  return {
    currentView,
    currentSceneName,
    currentNodeId,
    selectedMarker,
    isAudioMuted,
    isDirectoryOpen,
    lastClickedCoords,
    isLoaded,
    tourNodes,
    kioskData,
    stores: kioskData.stores,
    scenes: kioskData.scenes,
    initViewer,
    loadStore,
    teleportToNode,
    resetTour,
    toggleAudio,
    toggleDirectory,
    closeModal,
    dismissCoords
  }
}
