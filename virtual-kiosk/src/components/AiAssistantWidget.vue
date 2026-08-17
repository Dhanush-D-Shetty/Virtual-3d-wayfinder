<template>
  <div class="ai-widget-wrapper">
    <!-- Floating Aura FAB Button (Bottom Right) -->
    <button
      class="ai-fab-btn"
      :class="{ open: isOpen, listening: isListening }"
      @click="toggleAssistant"
      title="Open Aura AI Concierge (Voice & Chat)"
    >
      <div class="fab-glow"></div>
      <div class="fab-content">
        <Sparkles v-if="!isListening" class="fab-icon" :size="24" />
        <Mic v-else class="fab-icon mic-pulse" :size="24" />
        <span class="fab-label">Aura Concierge</span>
      </div>
      <span v-if="messages.length > 1" class="msg-badge">{{ messages.length - 1 }}</span>
    </button>

    <!-- Main Aura Concierge Chat Window -->
    <Transition name="slide-up">
      <div v-if="isOpen" class="ai-chat-window">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="header-title">
            <div class="ai-avatar">
              <Bot :size="20" class="bot-icon" />
              <span class="online-dot"></span>
            </div>
            <div>
              <h3>Aura - AI Concierge</h3>
              <p class="status-subtitle">
                <span v-if="apiKey" class="key-tag gemini">Gemini AI Active</span>
                <span v-else class="key-tag local">Local Intent Engine</span>
                • Voice & Controls Ready
              </p>
            </div>
          </div>

          <div class="header-actions">
            <!-- Voice Speech Synthesis Mute Toggle -->
            <button
              class="hdr-btn"
              :class="{ active: isVoiceEnabled }"
              @click="isVoiceEnabled = !isVoiceEnabled"
              :title="isVoiceEnabled ? 'Voice Response Enabled' : 'Voice Response Muted'"
            >
              <Volume2 v-if="isVoiceEnabled" :size="16" />
              <VolumeX v-else :size="16" />
            </button>

            <!-- API Key Settings Button -->
            <button
              class="hdr-btn"
              @click="showSettings = !showSettings"
              title="Configure Free AI Credentials"
            >
              <Settings :size="16" />
            </button>

            <!-- Close Chat Button -->
            <button class="hdr-btn close" @click="isOpen = false" title="Close Concierge">
              <X :size="18" />
            </button>
          </div>
        </div>

        <!-- Voice Listening Soundwave Visualizer Overlay -->
        <div v-if="isListening" class="voice-listening-banner">
          <div class="listening-status">
            <Mic class="listening-mic" :size="20" />
            <span>Aura is listening to your voice... Speak now!</span>
          </div>
          <div class="sound-wave">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </div>
          <button class="cancel-mic-btn" @click="toggleListening">Stop Listening</button>
        </div>

        <!-- Voice Error Toast Banner -->
        <div v-if="voiceError" class="voice-error-banner">
          <span>{{ voiceError }}</span>
          <button @click="voiceError = ''"><X :size="12" /></button>
        </div>

        <!-- Quick Action Suggestion Prompt Pills -->
        <div class="quick-pills-bar">
          <button
            v-for="(pill, idx) in suggestionPills"
            :key="idx"
            class="pill-btn"
            @click="handleQuickPrompt(pill.query)"
          >
            <component :is="pill.icon" :size="13" />
            <span>{{ pill.label }}</span>
          </button>
        </div>

        <!-- Conversation History Area -->
        <div class="chat-body" ref="chatBodyRef">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="chat-bubble-row"
            :class="msg.sender"
          >
            <div class="avatar-col">
              <div v-if="msg.sender === 'ai'" class="msg-avatar ai">
                <Bot :size="15" />
              </div>
              <div v-else class="msg-avatar user">
                <User :size="15" />
              </div>
            </div>

            <div class="msg-content">
              <div class="msg-bubble">
                <p>{{ msg.text }}</p>

                <!-- Rich Store Card inside Chat when Aura navigates -->
                <div v-if="msg.store" class="store-nav-card" @click="onCardClick(msg.store)">
                  <div class="card-badge" :class="msg.store.badgeColor || 'cyan'">
                    {{ msg.store.category }}
                  </div>
                  <h4>{{ msg.store.name }}</h4>
                  <p class="card-desc">{{ msg.store.description }}</p>
                  <div class="card-footer">
                    <span class="hours">⏰ {{ msg.store.hours }}</span>
                    <button class="jump-btn">
                      <Navigation :size="13" /> Jump to Location
                    </button>
                  </div>
                </div>

                <!-- Scene Teleport Card -->
                <div v-if="msg.scene" class="scene-teleport-card" @click="onSceneClick(msg.scene)">
                  <Compass :size="16" />
                  <span>Explore {{ msg.scene.name }}</span>
                </div>

                <!-- Action Confirmation Pill Tag -->
                <div v-if="msg.action && msg.action !== 'NAVIGATE_STORE' && msg.action !== 'ANSWER_QUERY'" class="action-tag">
                  <CheckCircle2 :size="12" /> Executed {{ msg.action.replace('_', ' ') }}
                </div>
              </div>
              <span class="msg-time">{{ msg.timestamp }}</span>
            </div>
          </div>

          <!-- Thinking Indicator -->
          <div v-if="isThinking" class="chat-bubble-row ai">
            <div class="avatar-col">
              <div class="msg-avatar ai"><Bot :size="15" /></div>
            </div>
            <div class="msg-bubble thinking-bubble">
              <div class="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input Footer -->
        <form class="chat-footer" @submit.prevent="onSendSubmit">
          <button
            type="button"
            class="mic-btn"
            :class="{ active: isListening }"
            @click="toggleListening"
            :title="isListening ? 'Stop Listening' : 'Speak to Aura with Voice'"
          >
            <Mic v-if="!isListening" :size="18" />
            <Square v-else :size="16" class="stop-icon" />
          </button>

          <input
            v-model="inputQuery"
            type="text"
            placeholder="Ask Aura to open stores, filter dining, mute audio..."
            :disabled="isThinking"
            ref="inputFieldRef"
          />

          <button
            type="submit"
            class="send-btn"
            :disabled="!inputQuery.trim() || isThinking"
            title="Send Message"
          >
            <Send :size="16" />
          </button>
        </form>

        <!-- Credentials & Settings Drawer Modal -->
        <Transition name="fade">
          <div v-if="showSettings" class="settings-overlay">
            <div class="settings-card">
              <div class="settings-header">
                <h4><Key :size="18" /> Aura Credentials & Settings</h4>
                <button class="hdr-btn" @click="showSettings = false"><X :size="16" /></button>
              </div>

              <div class="settings-body">
                <div class="setting-item">
                  <label>Google Gemini API Key (Free Tier):</label>
                  <input
                    v-model="tempApiKey"
                    type="password"
                    placeholder="AIzaSy..."
                    class="key-input"
                  />
                  <p class="hint">
                    Get a free API key at
                    <a href="https://aistudio.google.com/" target="_blank" rel="noopener">Google AI Studio</a>.
                  </p>
                </div>

                <div class="setting-item row">
                  <div>
                    <label>Auto Voice Response</label>
                    <p class="hint">Aura reads responses aloud in natural voice.</p>
                  </div>
                  <input type="checkbox" v-model="isVoiceEnabled" class="toggle-checkbox" />
                </div>

                <div class="info-box">
                  <Sparkles :size="16" class="info-icon" />
                  <p>
                    <strong>Zero-Key Fallback:</strong> Without an API key, Aura uses an offline intent engine for all 8 kiosk actions!
                  </p>
                </div>
              </div>

              <div class="settings-footer">
                <button class="cancel-btn" @click="showSettings = false">Cancel</button>
                <button class="save-btn" @click="onSaveSettings">Save Key</button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import {
  Sparkles,
  Bot,
  Mic,
  Send,
  X,
  Settings,
  Volume2,
  VolumeX,
  User,
  Navigation,
  Compass,
  Key,
  Square,
  Coffee,
  ShoppingBag,
  Watch,
  Luggage,
  Utensils,
  Store,
  RotateCcw,
  CheckCircle2,
  Home
} from 'lucide-vue-next'
import { useAiAssistant } from '../composables/useAiAssistant'

const props = defineProps({
  stores: {
    type: Array,
    default: () => []
  },
  scenes: {
    type: Array,
    default: () => []
  },
  loadStore: {
    type: Function,
    required: true
  },
  teleportToNode: {
    type: Function,
    required: true
  },
  toggleDirectory: {
    type: Function,
    default: null
  },
  filterCategory: {
    type: Function,
    default: null
  },
  toggleAudio: {
    type: Function,
    default: null
  },
  resetTour: {
    type: Function,
    default: null
  },
  switchView: {
    type: Function,
    default: null
  }
})

const {
  isOpen,
  messages,
  isThinking,
  isListening,
  isVoiceEnabled,
  showSettings,
  apiKey,
  voiceError,
  toggleAssistant,
  toggleListening,
  sendMessage,
  handleQuickPrompt,
  saveApiKey
} = useAiAssistant(props.stores, props.scenes, {
  loadStore: props.loadStore,
  teleportToNode: props.teleportToNode,
  toggleDirectory: props.toggleDirectory,
  filterCategory: props.filterCategory,
  toggleAudio: props.toggleAudio,
  resetTour: props.resetTour,
  switchView: props.switchView
})

const inputQuery = ref('')
const tempApiKey = ref(apiKey.value)
const chatBodyRef = ref(null)
const inputFieldRef = ref(null)

const suggestionPills = [
  { label: 'Take me to Starbucks', query: 'Take me to Starbucks Coffee', icon: Coffee },
  { label: 'Filter Dining & Cafes', query: 'Show me all dining places', icon: Utensils },
  { label: 'Filter Fashion Stores', query: 'Show me fashion stores', icon: ShoppingBag },
  { label: 'Show Rolex Watches', query: 'Take me to Rolex', icon: Watch },
  { label: 'Where is Luggage?', query: 'Show luggage stores', icon: Luggage },
  { label: 'Open Directory', query: 'Open directory catalog', icon: Store },
  { label: 'Mute Audio', query: 'Mute sound', icon: VolumeX },
  { label: 'Go to Home Screen', query: 'Go to home page', icon: Home }
]

function onSendSubmit() {
  if (!inputQuery.value.trim()) return
  const q = inputQuery.value
  inputQuery.value = ''
  sendMessage(q)
}

function onCardClick(store) {
  if (props.loadStore && store) {
    props.loadStore(store)
  }
}

function onSceneClick(scene) {
  if (props.teleportToNode && scene) {
    props.teleportToNode(scene.id)
  }
}

function onSaveSettings() {
  saveApiKey(tempApiKey.value)
}

// Auto scroll chat to bottom on new messages
watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
    }
  }
)

watch(isOpen, async (newVal) => {
  if (newVal) {
    tempApiKey.value = apiKey.value
    await nextTick()
    if (inputFieldRef.value) {
      inputFieldRef.value.focus()
    }
  }
})

defineExpose({
  toggleAssistant,
  toggleListening,
  isOpen
})
</script>

<style scoped>
.ai-widget-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99999;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* FAB Floating Action Button */
.ai-fab-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #0284c7 0%, #7c3aed 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 12px 20px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  box-shadow: 0 8px 30px rgba(2, 132, 199, 0.4), 0 0 20px rgba(124, 58, 237, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-fab-btn:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 12px 35px rgba(2, 132, 199, 0.6), 0 0 25px rgba(124, 58, 237, 0.5);
}

.ai-fab-btn.listening {
  background: linear-gradient(135deg, #dc2626, #e11d48);
  animation: pulse-border 1.5s infinite;
}

.fab-glow {
  position: absolute;
  inset: -2px;
  border-radius: 50px;
  background: linear-gradient(90deg, #38bdf8, #c084fc, #38bdf8);
  z-index: -1;
  opacity: 0.6;
  filter: blur(8px);
  animation: rotate-glow 4s linear infinite;
}

.fab-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fab-icon {
  animation: float-icon 2.5s ease-in-out infinite;
}

.mic-pulse {
  animation: pulse-mic 1s infinite alternate;
}

.msg-badge {
  background: #ef4444;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 12px;
  margin-left: 2px;
}

/* Chat Window Modal */
.ai-chat-window {
  position: absolute;
  bottom: 64px;
  right: 0;
  width: 420px;
  max-width: calc(100vw - 32px);
  height: 590px;
  max-height: calc(100vh - 100px);
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0284c7, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.online-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background: #22c55e;
  border: 2px solid #0f172a;
  border-radius: 50%;
}

.header-title h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #f8fafc;
}

.status-subtitle {
  margin: 2px 0 0 0;
  font-size: 0.72rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
}

.key-tag {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 700;
}
.key-tag.gemini {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}
.key-tag.local {
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hdr-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.hdr-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.hdr-btn.active {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.4);
}

.hdr-btn.close:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.4);
}

/* Voice Listening Soundwave */
.voice-listening-banner {
  background: linear-gradient(90deg, rgba(220, 38, 38, 0.25), rgba(225, 29, 72, 0.25));
  border-bottom: 1px solid rgba(239, 68, 68, 0.3);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.listening-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fca5a5;
  font-size: 0.78rem;
  font-weight: 600;
}

.listening-mic {
  color: #ef4444;
  animation: pulse-mic 0.8s infinite alternate;
}

.sound-wave {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 18px;
}

.sound-wave .bar {
  width: 3px;
  height: 100%;
  background: #ef4444;
  border-radius: 3px;
  animation: wave 1s ease-in-out infinite;
}
.sound-wave .bar:nth-child(1) { animation-delay: 0.0s; }
.sound-wave .bar:nth-child(2) { animation-delay: 0.2s; }
.sound-wave .bar:nth-child(3) { animation-delay: 0.4s; }
.sound-wave .bar:nth-child(4) { animation-delay: 0.1s; }
.sound-wave .bar:nth-child(5) { animation-delay: 0.3s; }

.cancel-mic-btn {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
}

.voice-error-banner {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  font-size: 0.75rem;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.voice-error-banner button {
  background: none;
  border: none;
  color: #fca5a5;
  cursor: pointer;
}

/* Suggestion Pills Bar */
.quick-pills-bar {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.15);
}
.quick-pills-bar::-webkit-scrollbar {
  display: none;
}

.pill-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.pill-btn:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.4);
  color: #38bdf8;
  transform: translateY(-1px);
}

/* Chat Body */
.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.chat-bubble-row {
  display: flex;
  gap: 10px;
  max-width: 88%;
}

.chat-bubble-row.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.chat-bubble-row.ai {
  align-self: flex-start;
}

.avatar-col {
  flex-shrink: 0;
}

.msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.msg-avatar.ai {
  background: linear-gradient(135deg, #0284c7, #7c3aed);
}
.msg-avatar.user {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}

.msg-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.msg-bubble {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 0.88rem;
  line-height: 1.45;
}

.chat-bubble-row.user .msg-bubble {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  border-color: rgba(56, 189, 248, 0.3);
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.chat-bubble-row.ai .msg-bubble {
  border-bottom-left-radius: 4px;
}

.msg-bubble p {
  margin: 0;
}

.msg-time {
  font-size: 0.65rem;
  color: #64748b;
  align-self: flex-end;
}
.chat-bubble-row.user .msg-time {
  align-self: flex-start;
}

/* Store Navigation Card */
.store-nav-card {
  margin-top: 10px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.store-nav-card:hover {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.08);
  box-shadow: 0 4px 15px rgba(2, 132, 199, 0.2);
}

.card-badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.card-badge.cyan { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
.card-badge.green { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
.card-badge.purple { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
.card-badge.amber { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }

.store-nav-card h4 {
  margin: 2px 0 6px 0;
  font-size: 0.92rem;
  color: #fff;
}

.card-desc {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.hours {
  font-size: 0.7rem;
  color: #64748b;
}

.jump-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #0284c7;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
}

/* Scene Teleport Card */
.scene-teleport-card {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #c084fc;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.scene-teleport-card:hover {
  background: rgba(168, 85, 247, 0.25);
}

.action-tag {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  font-weight: 700;
  color: #4ade80;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  padding: 3px 8px;
  border-radius: 8px;
}

/* Typing Dots */
.thinking-bubble {
  padding: 12px 18px;
}
.typing-dots {
  display: flex;
  gap: 4px;
}
.typing-dots span {
  width: 6px;
  height: 6px;
  background: #38bdf8;
  border-radius: 50%;
  animation: blink-dot 1.4s infinite both;
}
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

/* Input Footer */
.chat-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.04);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.mic-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #38bdf8;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.mic-btn:hover {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
}

.mic-btn.active {
  background: #dc2626;
  border-color: #ef4444;
  color: #fff;
  animation: pulse-mic 1s infinite alternate;
}

.chat-footer input {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.2s;
}

.chat-footer input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
}

.send-btn {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0369a1, #075985);
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Settings Overlay Drawer */
.settings-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.settings-card {
  width: 100%;
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.settings-header h4 {
  margin: 0;
  color: #fff;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.setting-item.row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.setting-item label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #cbd5e1;
}

.key-input {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
}

.hint {
  font-size: 0.72rem;
  color: #64748b;
  margin: 0;
}
.hint a {
  color: #38bdf8;
  text-decoration: underline;
}

.info-box {
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  gap: 10px;
  font-size: 0.75rem;
  color: #cbd5e1;
}
.info-icon {
  color: #38bdf8;
  flex-shrink: 0;
  margin-top: 2px;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.cancel-btn {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: #94a3b8;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
}
.save-btn {
  background: #0284c7;
  border: none;
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

/* Animations */
@keyframes rotate-glow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes float-icon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes pulse-mic {
  0% { transform: scale(1); }
  100% { transform: scale(1.15); }
}

@keyframes wave {
  0%, 100% { height: 4px; }
  50% { height: 16px; }
}

@keyframes blink-dot {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
