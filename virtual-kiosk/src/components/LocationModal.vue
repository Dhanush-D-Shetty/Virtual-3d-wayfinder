<template>
  <Transition name="modal-fade">
    <div v-if="markerData" class="modal-backdrop" @click.self="$emit('close')">
      <div class="location-modal">
        <!-- Modal Top Banner Image -->
        <div class="modal-media">
          <img :src="markerData.image || '/room1.jpg'" :alt="markerData.title" />
          <div class="media-overlay"></div>
          <span :class="['modal-badge', `badge-${markerData.badgeColor || 'cyan'}`]">
            {{ markerData.category }}
          </span>
          <button class="close-btn" @click="$emit('close')" aria-label="Close modal">
            <X :size="20" />
          </button>
        </div>

        <!-- Modal Content Body -->
        <div class="modal-content">
          <div class="title-row">
            <h2>{{ markerData.title }}</h2>
            <button class="voice-btn" @click="readAloud" title="Read Location Info Aloud">
              <Volume2 :size="18" />
              <span>Listen</span>
            </button>
          </div>

          <div class="meta-row">
            <Clock :size="16" class="meta-icon" />
            <span>Operating Hours: <strong>{{ markerData.hours }}</strong></span>
          </div>

          <p class="description">{{ markerData.description }}</p>

          <!-- Key Highlights -->
          <div v-if="markerData.highlights" class="highlights-section">
            <h4>Key Features</h4>
            <ul>
              <li v-for="(item, idx) in markerData.highlights" :key="idx">
                <CheckCircle2 :size="14" class="check-icon" />
                {{ item }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="modal-footer">
          <button class="action-btn secondary" @click="$emit('close')">
            Close Details
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { X, Clock, CheckCircle2, Volume2 } from 'lucide-vue-next'
import { soundFx } from '../utils/soundEffects'

const props = defineProps({
  markerData: {
    type: Object,
    default: null
  }
})

defineEmits(['close'])

const readAloud = () => {
  if (props.markerData) {
    soundFx.speakText(`${props.markerData.title}. ${props.markerData.description}`)
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(3, 7, 18, 0.7);
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
}

.location-modal {
  width: 100%;
  max-width: 480px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(56, 189, 248, 0.15);
}

.modal-media {
  position: relative;
  height: 180px;
  width: 100%;
  overflow: hidden;
}

.modal-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 1) 0%, transparent 80%);
}

.modal-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #fff;
}

.badge-cyan { background: #0284c7; box-shadow: 0 0 12px rgba(2, 132, 199, 0.6); }
.badge-purple { background: #7c3aed; box-shadow: 0 0 12px rgba(124, 58, 237, 0.6); }
.badge-amber { background: #d97706; box-shadow: 0 0 12px rgba(217, 119, 6, 0.6); }
.badge-green { background: #16a34a; box-shadow: 0 0 12px rgba(22, 163, 74, 0.6); }

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.8);
  transform: scale(1.05);
}

.modal-content {
  padding: 20px 24px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.title-row h2 {
  font-size: 1.35rem;
  font-weight: 700;
  color: #f8fafc;
}

.voice-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.voice-btn:hover {
  background: rgba(56, 189, 248, 0.3);
  transform: scale(1.05);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #38bdf8;
  font-size: 0.85rem;
  margin-bottom: 14px;
}

.description {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #94a3b8;
  margin-bottom: 18px;
}

.highlights-section h4 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #cbd5e1;
  margin-bottom: 8px;
}

.highlights-section ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.highlights-section li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #e2e8f0;
}

.check-icon {
  color: #34d399;
}

.modal-footer {
  padding: 16px 24px 20px;
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
