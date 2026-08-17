import { ref, onMounted, onUnmounted } from 'vue'
import { processAiQuery } from '../services/aiService'
import { soundFx } from '../utils/soundEffects'

export function useAiAssistant(stores, scenes, kioskActions = {}) {
  const {
    loadStore,
    teleportToNode,
    toggleDirectory,
    filterCategory,
    toggleAudio,
    resetTour,
    switchView
  } = kioskActions

  const isOpen = ref(false)
  const isThinking = ref(false)
  const isListening = ref(false)
  const isVoiceEnabled = ref(true)
  const showSettings = ref(false)
  const voiceError = ref('')

  // Retrieve API key from localStorage or Vite env
  const apiKey = ref(
    localStorage.getItem('kiosk_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || ''
  )

  // Chat message history with Aura branding
  const messages = ref([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: "✨ Hello! I'm Aura, your AI Kiosk Concierge. Ask me to open stores (e.g. Starbucks, Nike, Rolex), filter dining, mute audio, reset the tour, or guide your way!",
      store: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])

  // Speech Recognition instance
  let recognition = null

  onMounted(() => {
    initSpeechRecognition()
  })

  onUnmounted(() => {
    if (recognition) {
      try {
        recognition.stop()
      } catch (e) {}
    }
  })

  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API is not supported in this browser.')
      return
    }

    try {
      recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        isListening.value = true
        voiceError.value = ''
        soundFx.playUiChime(660)
      }

      recognition.onresult = (event) => {
        isListening.value = false
        const transcript = event.results[0][0].transcript
        if (transcript) {
          sendMessage(transcript)
        }
      }

      recognition.onerror = (event) => {
        isListening.value = false
        if (event.error !== 'no-speech') {
          voiceError.value = `Voice error: ${event.error}`
          console.warn('Speech recognition error:', event.error)
        }
      }

      recognition.onend = () => {
        isListening.value = false
      }
    } catch (err) {
      console.warn('Could not initialize SpeechRecognition:', err)
    }
  }

  function toggleListening() {
    if (!recognition) {
      voiceError.value = 'Voice recognition is not supported in your current browser.'
      return
    }

    if (isListening.value) {
      recognition.stop()
    } else {
      try {
        isOpen.value = true
        recognition.start()
      } catch (e) {
        console.warn('Error starting speech recognition:', e)
      }
    }
  }

  function toggleAssistant() {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      soundFx.playUiChime(520)
    }
  }

  function saveApiKey(newKey) {
    apiKey.value = newKey.trim()
    localStorage.setItem('kiosk_gemini_api_key', apiKey.value)
    showSettings.value = false
    soundFx.playUiChime(880)
  }

  async function sendMessage(textInput) {
    const text = textInput?.trim()
    if (!text || isThinking.value) return

    // 1. Add user message to conversation list
    messages.value.push({
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })

    isThinking.value = true
    soundFx.playWhoosh()

    try {
      // 2. Process query via Aura AI service
      const aiResult = await processAiQuery(text, stores, scenes, apiKey.value)

      if (aiResult) {
        // Add Aura response to chat
        messages.value.push({
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiResult.reply,
          store: aiResult.store || null,
          scene: aiResult.scene || null,
          action: aiResult.action,
          category: aiResult.category || null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })

        // 3. Speak Aura response if voice mode is enabled
        if (isVoiceEnabled.value && aiResult.reply) {
          soundFx.speakText(aiResult.reply)
        }

        // 4. Dispatch Kiosk Actions based on action type
        switch (aiResult.action) {
          case 'NAVIGATE_STORE':
            if (aiResult.store && loadStore) {
              loadStore(aiResult.store)
            }
            break

          case 'TELEPORT_SCENE':
            if (aiResult.scene && teleportToNode) {
              teleportToNode(aiResult.scene.id)
            }
            break

          case 'FILTER_CATEGORY':
            if (filterCategory) {
              filterCategory(aiResult.category)
            }
            break

          case 'TOGGLE_DIRECTORY':
            if (toggleDirectory) {
              toggleDirectory()
            }
            break

          case 'TOGGLE_AUDIO':
            if (toggleAudio) {
              toggleAudio()
            }
            break

          case 'RESET_TOUR':
            if (resetTour) {
              resetTour()
            }
            break

          case 'SWITCH_VIEW':
            if (switchView && aiResult.targetView) {
              switchView(aiResult.targetView)
            }
            break

          case 'ANSWER_QUERY':
          default:
            // Answer query response already displayed & spoken
            break
        }
      }
    } catch (err) {
      console.error('Error handling Aura AI query:', err)
      messages.value.push({
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: "I encountered a problem processing that request. Try asking: 'Show all dining places', 'Mute audio', or 'Take me to Starbucks'.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
    } finally {
      isThinking.value = false
    }
  }

  function handleQuickPrompt(promptText) {
    sendMessage(promptText)
  }

  return {
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
  }
}
