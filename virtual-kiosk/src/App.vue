<template>
  <div class="kiosk-wrapper">
    <!-- Glassmorphic Header -->
    <KioskHeader :current-view="currentView" :scene-title="currentView === 'home' ? 'Home Directory' : currentSceneName"
      :subtitle="currentView === 'home' ? 'Explore Kiosk Stores & Wayfinding' : 'Interactive Virtual Kiosk Tour'"
      :is-muted="isAudioMuted" @reset="resetTour" @toggle-audio="toggleAudio" @toggle-directory="toggleDirectory"
      @toggle-ai="toggleAiWidget"
      @change-view="switchView" />

    <!-- VIEW 1: Home Page Landing Screen -->
    <HomePage v-if="currentView === 'home'" :stores="stores" :scenes="scenes" @select-store="loadStore"
      @enter-360="currentView = 'map'" />

    <!-- VIEW 2: 360° Interactive Spatial Map Viewport -->
    <VirtualTourViewer v-else-if="currentView === 'map'" :init-viewer="initViewer" />

    <!-- OVERLAY 1: Store & Wayfinding Directory Catalog Drawer -->
    <StoreDirectory
      :is-open="isDirectoryOpen"
      :stores="stores"
      :scenes="scenes"
      :category-filter="activeCategoryFilter"
      @close="isDirectoryOpen = false"
      @select-store="loadStore"
    />

    <!-- OVERLAY 2: Floor Plan Radar Minimap Widget (Map Mode Only) -->
    <KioskMinimap v-if="currentView === 'map'" :nodes="tourNodes" :current-node-id="currentNodeId"
      @teleport="teleportToNode" />

    <!-- OVERLAY 3: Interactive Location Details Modal -->
    <LocationModal :marker-data="selectedMarker" @close="closeModal" />

    <!-- OVERLAY 4: Developer Pitch & Yaw Coordinates Picker Toast (Map Mode Only) -->
    <CoordPicker v-if="currentView === 'map'" :coords="lastClickedCoords" @dismiss="dismissCoords" />

    <!-- OVERLAY 5: Aura AI Voice & Chat Concierge Floating Widget -->
    <AiAssistantWidget
      ref="aiWidgetRef"
      :stores="stores"
      :scenes="scenes"
      :load-store="loadStore"
      :teleport-to-node="teleportToNode"
      :toggle-directory="toggleDirectory"
      :filter-category="handleCategoryFilter"
      :toggle-audio="toggleAudio"
      :reset-tour="resetTour"
      :switch-view="switchView"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import KioskHeader from './components/KioskHeader.vue'
import HomePage from './components/HomePage.vue'
import VirtualTourViewer from './components/VirtualTourViewer.vue'
import KioskMinimap from './components/KioskMinimap.vue'
import LocationModal from './components/LocationModal.vue'
import StoreDirectory from './components/StoreDirectory.vue'
import CoordPicker from './components/CoordPicker.vue'
import AiAssistantWidget from './components/AiAssistantWidget.vue'
import { useVirtualTour } from './composables/useVirtualTour'

// Import Global Styling
import './styles/kiosk.css'

const aiWidgetRef = ref(null)
const activeCategoryFilter = ref('All')

const {
  currentView,
  currentSceneName,
  currentNodeId,
  selectedMarker,
  isAudioMuted,
  isDirectoryOpen,
  lastClickedCoords,
  tourNodes,
  stores,
  scenes,
  initViewer,
  loadStore,
  teleportToNode,
  resetTour,
  toggleAudio,
  toggleDirectory,
  closeModal,
  dismissCoords
} = useVirtualTour()

const toggleAiWidget = () => {
  if (aiWidgetRef.value) {
    aiWidgetRef.value.toggleAssistant()
  }
}

const handleCategoryFilter = (category) => {
  if (category) {
    activeCategoryFilter.value = category
  } else {
    activeCategoryFilter.value = 'All'
  }
  isDirectoryOpen.value = true
}

const switchView = (targetView) => {
  if (targetView) {
    currentView.value = targetView
  }
}
</script>