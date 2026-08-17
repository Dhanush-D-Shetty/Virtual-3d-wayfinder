<template>
  <div class="kiosk-wrapper">
    <!-- Modern UI Overlay Header -->
    <header class="kiosk-header">
      <div class="brand-info">
        <MapPin class="icon-pulse" :size="24" />
        <div>
          <h1>{{ currentSceneName }}</h1>
          <p>Interactive Virtual Kiosk Tour</p>
        </div>
      </div>
      <div class="kiosk-actions">
        <button class="kiosk-btn" @click="resetTour">
          <RotateCcw :size="18" /> Reset Entry
        </button>
      </div>
    </header>

    <!-- 360 Panorama Canvas Container -->
    <div ref="viewerContainer" class="viewer-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Viewer } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin'

import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import '@photo-sphere-viewer/virtual-tour-plugin/index.css'

import { MapPin, RotateCcw } from 'lucide-vue-next'

const viewerContainer = ref(null)
let viewerInstance = null
let virtualTourPlugin = null
const currentSceneName = ref('Entrance Hall')

// Define Tour Nodes (Scenes, Paths, and Floating Location Tags)
const tourNodes = [
  {
    id: 'node-1',
    panorama: '/room1.jpg',
    name: 'Entrance Hall',
    links: [
      {
        nodeId: 'node-2',
        position: { pitch: -0.2, yaw: 0.1 }, // Direction path to Room 2
      }
    ],
    markers: [
      {
        id: 'tag-reception',
        position: { pitch: 0.03, yaw: 0.21 },
        html: `<div class="custom-tag">
                 <span class="tag-badge">Information</span>
                 <p class="tag-title">Help Desk / Reception</p>
               </div>`,
        tooltip: 'Click to open details',
        data: {
          description: 'Welcome to the main reception! Operating hours: 9 AM - 6 PM.'
        },
        anchor: 'bottom center'
      },
      {
        id: 'tag-kitchen',
        position: { pitch: 0.03, yaw: 3.89 },
        html: `<div class="custom-tag">
                 <span class="tag-badge">Study</span>
                 <p class="tag-title">Study desk</p>
               </div>`,
        anchor: 'bottom center'
      }
    ]
  },
  {
    id: 'node-2',
    panorama: '/room2.jpg',
    name: 'Main Exhibition Gallery',
    links: [
      {
        nodeId: 'node-1',
        position: { pitch: -0.2, yaw: 3.14 } // Path back to Entrance
      },
      {
        nodeId: 'node-3',
        position: { pitch: -0.18, yaw: 0.5 } // Path to Courtyard
      }
    ],
    markers: [
      {
        id: 'tag-exhibit',
        position: { pitch: 0.15, yaw: 0.8 },
        html: `<div class="custom-tag">
                 <span class="tag-badge">Exhibit</span>
                 <p class="tag-title">Digital Art Space</p>
               </div>`,
        anchor: 'bottom center'
      }
    ]
  },
  {
    id: 'node-3',
    panorama: '/room3.jpg',
    name: 'Outdoor Courtyard',
    links: [
      {
        nodeId: 'node-2',
        position: { pitch: -0.2, yaw: 3.1 } // Path back to Gallery
      }
    ],
    markers: [
      {
        id: 'tag-cafeteria',
        position: { pitch: 0.05, yaw: 1.2 },
        html: `<div class="custom-tag">
                 <span class="tag-badge">Amenities</span>
                 <p class="tag-title">Garden Café</p>
               </div>`,
        anchor: 'bottom center'
      }
    ]
  }
]


// --- CUSTOM HUMAN WALKING ANIMATION ---
const walkToNode = async (targetNodeId, targetPosition) => {
  if (!viewerInstance || !virtualTourPlugin) return

  const totalSteps = 16       // Number of "footsteps"
  const stepInterval = 40     // Milliseconds per step

  // 1. Swivel camera to face the target arrow/direction first
  await viewerInstance.animate({
    yaw: targetPosition.yaw,
    pitch: targetPosition.pitch,
    speed: '1200ms'
  })

  // 2. Simulate Head-Bobbing (Alternating Pitch) + Moving Forward
  for (let i = 0; i < totalSteps; i++) {
    const isLeftStep = i % 2 === 0
    // Subtle up/down tilt for walking bob
    const bobOffset = isLeftStep ? 0.012 : -0.012 

    viewerInstance.rotate({
      yaw: targetPosition.yaw,
      pitch: targetPosition.pitch + bobOffset
    })

    // Short pause per footstep
    await new Promise((resolve) => setTimeout(resolve, stepInterval))
  }

  // 3. Swap to the next room/node once the walk completes
  virtualTourPlugin.setCurrentNode(targetNodeId)
}

onMounted(() => {
  if (!viewerContainer.value) return

  // Initialize Viewer
  viewerInstance = new Viewer({
    container: viewerContainer.value,
    navbar: ['autorotate', 'zoom', 'fullscreen'],
    autorotateSpeed: '1rpm',
    autorotateDelay: 5000, // Starts rotating 10 seconds after user stops touching screen
    autorotatePitch: -0.1,
    defaultPitch: -0.1,
    plugins: [
      [MarkersPlugin],
      [
        VirtualTourPlugin,
        {
          renderMode: '3d', // Places 3D directional arrows on the floor
          // arrowPosition: 'bottom',

          // --- KEY CHANGES FOR WALKING ANIMATION ---
          // // 1. Rotate the camera to face the target node before moving
          // rotateToNode: true,

          // 2. Configure the transition to simulate forward motion
          // transitionOptions: {
          //   effect: 'fade', // Valid values: 'fade' | 'rotate-fade' | 'chunk'
          //   rotation: true,      // Automatically swivels camera toward target link
          //   speed:  1200,      // Speed of rotation alignment
          //   fadeIn: true,
          //   // showEntireImage: false,
          //   showLoader: false    // Prevents black screen loader flashes between cached nodes
          // },

          // Custom Arrow SVG icon
          // arrowStyle: {
          //   color: '#38bdf8',
          //   hoverColor: '#2563eb',
          //   outlineColor: '#ffffff',
          //   //size: 0 // Scale multiplier
          // },
          // transitionOptions: {
          //   speed: 1200,
          //   effect: 'fade'  // Options: 'fade', 'rotate-fade', 'chunk'
          // },

          // Optional: Controls the zoom level during transition to feel like walking forward
          // zoomToNode: true,

          // RESTORED: Required properties to load the tour
          nodes: tourNodes,
          startNodeId: 'node-1'
        }
      ]
    ]
  })

  // Plugin reference & event listeners
  virtualTourPlugin = viewerInstance.getPlugin(VirtualTourPlugin)

  // --- INTERCEPT CLICK FOR WALKING ANIMATION ---
  virtualTourPlugin.addEventListener('select-node', (e) => {
    // Prevent default instant jump
    e.preventDefault() 

    // Find target link position to calculate walking direction
    const currentNode = virtualTourPlugin.getCurrentNode()
    const targetLink = currentNode.links?.find(l => l.nodeId === e.nodeId)

    if (targetLink) {
      // Trigger custom head-bobbing walk!
      walkToNode(e.nodeId, targetLink.position)
    } else {
      virtualTourPlugin.setCurrentNode(e.nodeId)
    }
  })

  // Listen to Node Changes to Update UI Heading & Active Markers
  virtualTourPlugin.addEventListener('node-changed', ({ node }) => {
    currentSceneName.value = node.name
  })


  // for getting the clicked position on image (pitch, yaw) for debugging or future features
  viewerInstance.addEventListener('click', ({ data }) => {
    console.log(`Clicked position -> pitch: ${data.pitch.toFixed(2)}, yaw: ${data.yaw.toFixed(2)}`)
  })
})

const resetTour = () => {
  if (virtualTourPlugin) {
    virtualTourPlugin.setCurrentNode('node-1')
  }
}

onUnmounted(() => {
  if (viewerInstance) {
    viewerInstance.destroy()
  }
})
</script>

<style>
/* Reset & Fullscreen layout */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body,
html,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: #0d1117;
  color: #ffffff;
}

.kiosk-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.viewer-container {
  width: 100%;
  height: 100%;
}

/* Glassmorphism Header */
.kiosk-header {
  position: absolute;
  top: 24px;
  left: 24px;
  right: 24px;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(18, 24, 38, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 16px 28px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  pointer-events: auto;
}

.brand-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-pulse {
  color: #38bdf8;
  filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.6));
}

.brand-info h1 {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.brand-info p {
  font-size: 0.85rem;
  color: #94a3b8;
}

.kiosk-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.kiosk-btn:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

/* Custom 3D Floating Location Pin Tag */
.custom-tag {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(56, 189, 248, 0.4);
  padding: 10px 16px;
  border-radius: 12px;
  color: #fff;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  transform: scale(0.95);
  transition: transform 0.2s ease;
}

.custom-tag:hover {
  transform: scale(1.05);
  border-color: #38bdf8;
}

.tag-badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #0284c7;
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 20px;
  margin-bottom: 4px;
}

.tag-title {
  font-size: 0.9rem;
  font-weight: 600;
}
</style>