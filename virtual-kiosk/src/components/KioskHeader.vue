<template>
  <header class="kiosk-header">
    <div class="brand-info">
      <div class="icon-badge">
        <MapPin class="icon-pulse" :size="22" />
      </div>
      <div>
        <div class="title-row">
          <h1>{{ sceneTitle }}</h1>
          <span class="live-pill">
            <span class="pill-dot"></span> LIVE 360°
          </span>
        </div>
        <p>{{ subtitle }}</p>
      </div>
    </div>

    <!-- Mode Switcher Tabs & Controls -->
    <div class="kiosk-actions">
      <!-- Home / 360 Map Mode Toggle Tabs -->
      <div class="mode-tabs">
        <button
          class="tab-btn"
          :class="{ active: currentView === 'home' }"
          @click="$emit('change-view', 'home')"
        >
          <Home :size="16" /> Home
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentView === 'map' }"
          @click="$emit('change-view', 'map')"
        >
          <Compass :size="16" /> 360° Map
        </button>
      </div>

      <!-- AI Assistant Launch Button -->
      <button
        class="kiosk-btn ai-hdr-btn"
        @click="$emit('toggle-ai')"
        title="Open AI Voice & Chat Assistant"
      >
        <Sparkles :size="18" class="sparkle-anim" /> AI Assistant
      </button>

      <!-- Store Directory Toggle Button (Visible in Map Mode) -->
      <button
        v-if="currentView === 'map'"
        class="kiosk-btn directory-btn"
        @click="$emit('toggle-directory')"
      >
        <Store :size="18" /> Directory Catalog
      </button>

      <!-- Mute / Unmute Sound Effects & Voice -->
      <button
        class="icon-btn"
        :class="{ muted: isMuted }"
        @click="$emit('toggle-audio')"
        :title="isMuted ? 'Unmute Voice & Sound' : 'Mute Voice & Sound'"
      >
        <Volume2 v-if="!isMuted" :size="18" />
        <VolumeX v-else :size="18" />
      </button>

      <!-- Reset Tour Button (Visible in Map Mode) -->
      <button v-if="currentView === 'map'" class="kiosk-btn" @click="$emit('reset')">
        <RotateCcw :size="18" /> Reset Entry
      </button>
    </div>
  </header>
</template>

<script setup>
import { MapPin, RotateCcw, Volume2, VolumeX, Store, Home, Compass, Sparkles } from 'lucide-vue-next'

defineProps({
  currentView: {
    type: String,
    default: 'home'
  },
  sceneTitle: {
    type: String,
    default: 'Entrance Hall'
  },
  subtitle: {
    type: String,
    default: 'Interactive Virtual Kiosk Tour'
  },
  isMuted: {
    type: Boolean,
    default: false
  }
})

defineEmits(['reset', 'toggle-audio', 'toggle-directory', 'change-view', 'toggle-ai'])
</script>

<style scoped>
.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.live-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
  padding: 3px 8px;
  border-radius: 20px;
}

.pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
  animation: blink 1.5s infinite;
}

.kiosk-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mode-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 3px;
  gap: 4px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #94a3b8;
  padding: 8px 14px;
  border-radius: 9px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #fff;
}

.tab-btn.active {
  background: #0284c7;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
}

.directory-btn {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  border-color: rgba(56, 189, 248, 0.4);
}

.directory-btn:hover {
  background: linear-gradient(135deg, #0369a1, #075985);
  box-shadow: 0 6px 20px rgba(2, 132, 199, 0.5);
}

.icon-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: #38bdf8;
  color: #38bdf8;
}

.icon-btn.muted {
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.4);
}

.ai-hdr-btn {
  background: linear-gradient(135deg, #7c3aed, #0284c7);
  border-color: rgba(168, 85, 247, 0.4);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
}

.ai-hdr-btn:hover {
  background: linear-gradient(135deg, #6d28d9, #0369a1);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.5);
}

.sparkle-anim {
  color: #f472b6;
  animation: pulse 2s infinite alternate;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
