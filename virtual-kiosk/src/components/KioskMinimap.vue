<template>
  <div class="minimap-container" :class="{ expanded: isExpanded }">
    <div class="minimap-header" @click="isExpanded = !isExpanded">
      <div class="header-title">
        <Compass class="icon-spin" :size="16" />
        <span>FLOOR PLAN RADAR</span>
      </div>
      <button class="toggle-btn" aria-label="Toggle minimap">
        <ChevronUp v-if="!isExpanded" :size="16" />
        <ChevronDown v-else :size="16" />
      </button>
    </div>

    <div v-show="isExpanded" class="minimap-body">
      <!-- Architectural Floor Grid Graphic -->
      <div class="floor-grid">
        <!-- Room Node Teleport Markers -->
        <div v-for="node in nodes" :key="node.id" class="map-node-dot" :class="{ active: node.id === currentNodeId }"
          :style="{ left: node.mapCoords.x + '%', top: node.mapCoords.y + '%' }"
          @click.stop="$emit('teleport', node.id)" :title="node.name">
          <div class="dot-pulse" v-if="node.id === currentNodeId"></div>
          <span class="node-label">{{ node.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Compass, ChevronUp, ChevronDown } from 'lucide-vue-next'

defineProps({
  nodes: {
    type: Array,
    required: true
  },
  currentNodeId: {
    type: String,
    required: true
  }
})

defineEmits(['teleport'])

const isExpanded = ref(true)
</script>

<style scoped>
.minimap-container {
  position: absolute;
  bottom: 24px;
  left: 24px;
  z-index: 20;
  width: 260px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.1);
  transition: all 0.3s ease;
}

.minimap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(30, 41, 59, 0.6);
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #38bdf8;
}

.toggle-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.minimap-body {
  position: relative;
  height: 160px;
  padding: 12px;
  overflow: hidden;
}

.floor-grid {
  position: relative;
  width: 100%;
  height: 100%;
  background-size: 20px 20px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  border: 1px dashed rgba(56, 189, 248, 0.25);
  border-radius: 10px;
}

.map-node-dot {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #64748b;
  border: 2px solid #0f172a;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
}

.map-node-dot:hover {
  transform: translate(-50%, -50%) scale(1.4);
  background: #38bdf8;
}

.map-node-dot.active {
  background: #38bdf8;
  box-shadow: 0 0 12px #38bdf8;
}

.dot-pulse {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid #38bdf8;
  animation: radar-pulse 1.8s infinite;
}

.node-label {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 0.65rem;
  font-weight: 700;
  color: #cbd5e1;
  background: rgba(15, 23, 42, 0.85);
  padding: 1px 6px;
  border-radius: 4px;
  pointer-events: none;
}

@keyframes radar-pulse {
  0% {
    transform: scale(0.6);
    opacity: 1;
  }

  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}
</style>
