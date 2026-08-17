<template>
  <Transition name="toast-fade">
    <div v-if="coords" class="coord-picker-toast">
      <div class="coord-info">
        <Target :size="16" class="target-icon" />
        <div>
          <span class="coord-label">Clicked Coordinates</span>
          <p class="coord-val">
            Pitch: <strong>{{ coords.pitch.toFixed(2) }}</strong> | Yaw: <strong>{{ coords.yaw.toFixed(2) }}</strong>
          </p>
        </div>
      </div>

      <button class="copy-btn" @click="copySnippet">
        <Check v-if="copied" :size="14" />
        <Copy v-else :size="14" />
        <span>{{ copied ? 'Copied!' : 'Copy JSON' }}</span>
      </button>

      <button class="close-toast-btn" @click="$emit('dismiss')">
        <X :size="14" />
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Target, Copy, Check, X } from 'lucide-vue-next'

const props = defineProps({
  coords: {
    type: Object,
    default: null
  }
})

defineEmits(['dismiss'])

const copied = ref(false)

const copySnippet = () => {
  if (!props.coords) return
  const snippet = `"position": { "pitch": ${props.coords.pitch.toFixed(2)}, "yaw": ${props.coords.yaw.toFixed(2)} }`
  navigator.clipboard.writeText(snippet)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

watch(() => props.coords, () => {
  copied.value = false
})
</script>

<style scoped>
.coord-picker-toast {
  position: absolute;
  bottom: 24px;
  right: 24px;
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(56, 189, 248, 0.4);
  padding: 10px 16px;
  border-radius: 14px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6), 0 0 25px rgba(56, 189, 248, 0.2);
}

.coord-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.target-icon {
  color: #38bdf8;
  animation: pulse-target 1.5s infinite;
}

.coord-label {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #38bdf8;
}

.coord-val {
  font-size: 0.85rem;
  color: #f8fafc;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: rgba(56, 189, 248, 0.3);
  transform: scale(1.04);
}

.close-toast-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.close-toast-btn:hover {
  color: #fff;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes pulse-target {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}
</style>
