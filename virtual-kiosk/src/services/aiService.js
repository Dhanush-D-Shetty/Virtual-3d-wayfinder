/**
 * AI Service for Aura - Virtual Kiosk Concierge
 * Connects to Google Gemini API (Free Tier) or uses the Expanded Local Intent Engine
 */

export async function processAiQuery(userText, stores = [], scenes = [], apiKey = '') {
  const text = userText.trim()
  if (!text) return null

  // 1. If API key is provided, attempt Gemini API request first
  if (apiKey) {
    try {
      const geminiResponse = await callGeminiApi(text, stores, scenes, apiKey)
      if (geminiResponse) {
        return geminiResponse
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to expanded local intent parser:', err)
    }
  }

  // 2. Fallback to Expanded Local Intent Engine (Zero API Key needed)
  return parseLocalIntent(text, stores, scenes)
}

/**
 * Call Google Gemini REST API (gemini-1.5-flash) with Aura AI Concierge persona
 */
async function callGeminiApi(userQuery, stores, scenes, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

  const storeCatalog = stores.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    description: s.description,
    highlights: s.highlights,
    hours: s.hours,
    nodeId: s.nodeId
  }))

  const sceneCatalog = scenes.map((sc) => ({
    id: sc.id,
    name: sc.name
  }))

  const systemInstruction = `You are "Aura", an elegant, warm, and highly capable AI Virtual Concierge for a 360° interactive airport/mall kiosk tour.
Your job is to assist visitors by taking them to stores, controlling kiosk UI features (directory drawer, audio, reset tour, view modes), filtering categories, or answering questions.

STORES CATALOG:
${JSON.stringify(storeCatalog, null, 2)}

SCENES LIST:
${JSON.stringify(sceneCatalog, null, 2)}

AVAILABLE ACTIONS SCHEMA:
Respond with ONLY a single valid JSON object (no markdown, no code blocks):
{
  "action": "NAVIGATE_STORE" | "TELEPORT_SCENE" | "FILTER_CATEGORY" | "TOGGLE_DIRECTORY" | "TOGGLE_AUDIO" | "RESET_TOUR" | "SWITCH_VIEW" | "ANSWER_QUERY",
  "storeId": "store-id-string" | null,
  "nodeId": "node-id-string" | null,
  "category": "Dining" | "Fashion" | "Luxury" | "Beauty" | "Work Zone" | "Information" | "Exhibit" | null,
  "targetView": "home" | "map" | null,
  "reply": "Warm natural response spoken aloud by Aura (1-2 sentences max)"
}

RULES:
- "NAVIGATE_STORE": User asks for a specific store or item (e.g. coffee, shoes, Rolex, luggage). Set storeId.
- "TELEPORT_SCENE": User asks to visit Entrance Hall, Exhibition Gallery, or Outdoor Courtyard. Set nodeId.
- "FILTER_CATEGORY": User asks to see all dining, food, cafes, fashion, luxury, beauty, or work places. Set category.
- "TOGGLE_DIRECTORY": User asks to open or close the directory catalog drawer.
- "TOGGLE_AUDIO": User asks to mute, unmute, or silence kiosk audio.
- "RESET_TOUR": User asks to reset or start over from the beginning.
- "SWITCH_VIEW": User asks to go to home screen or open 360 map mode. Set targetView.
- "ANSWER_QUERY": Questions about Wi-Fi, 24/7 hours, flight status, TSA locks, etc. Keep reply informative and charming!`

  const bodyData = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemInstruction}\n\nUSER INPUT: "${userQuery}"` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 250
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData)
  })

  if (!response.ok) {
    throw new Error(`Gemini API error status: ${response.status}`)
  }

  const data = await response.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim()
  const parsed = JSON.parse(cleanedText)

  if (parsed.action === 'NAVIGATE_STORE' && parsed.storeId) {
    const matchedStore = stores.find((s) => s.id === parsed.storeId)
    if (matchedStore) {
      return {
        action: 'NAVIGATE_STORE',
        store: matchedStore,
        reply: parsed.reply || `Certainly! Taking you directly to ${matchedStore.name}.`
      }
    }
  }

  if (parsed.action === 'TELEPORT_SCENE' && parsed.nodeId) {
    const matchedScene = scenes.find((sc) => sc.id === parsed.nodeId)
    if (matchedScene) {
      return {
        action: 'TELEPORT_SCENE',
        scene: matchedScene,
        reply: parsed.reply || `Teleporting you to the ${matchedScene.name}.`
      }
    }
  }

  return {
    action: parsed.action || 'ANSWER_QUERY',
    category: parsed.category || null,
    targetView: parsed.targetView || null,
    reply: parsed.reply || "I'm Aura, your AI Concierge! How can I assist your journey today?"
  }
}

/**
 * Expanded Local Intent Engine (8 Actions without API Key)
 */
function parseLocalIntent(query, stores, scenes) {
  const q = query.toLowerCase()

  // Action 1: Mute / Unmute Audio Command
  if (q.includes('mute') || q.includes('unmute') || q.includes('silence') || q.includes('be quiet') || q.includes('turn off sound')) {
    return {
      action: 'TOGGLE_AUDIO',
      reply: 'Toggling kiosk audio settings for you.'
    }
  }

  // Action 2: Reset Tour Command
  if (q.includes('reset') || q.includes('start over') || q.includes('back to start') || q.includes('entry hall')) {
    return {
      action: 'RESET_TOUR',
      reply: 'Resetting tour entry point back to the Entrance Hall.'
    }
  }

  // Action 3: View Mode Switching
  if (q.includes('go home') || q.includes('home page') || q.includes('home screen') || q.includes('landing')) {
    return {
      action: 'SWITCH_VIEW',
      targetView: 'home',
      reply: 'Switching view back to the Home Directory landing page.'
    }
  }
  if (q.includes('360 map') || q.includes('map view') || q.includes('open map') || q.includes('virtual map')) {
    return {
      action: 'SWITCH_VIEW',
      targetView: 'map',
      reply: 'Opening the 360° spatial map viewport.'
    }
  }

  // Action 4: Category Filtering
  if (q.includes('dining') || q.includes('food') || q.includes('eat') || q.includes('cafe') || q.includes('restaurant') || q.includes('hungry')) {
    return {
      action: 'FILTER_CATEGORY',
      category: 'Dining',
      reply: 'Opening our directory catalog filtered to all Dining & Cafe options!'
    }
  }
  if (q.includes('fashion') || q.includes('clothes') || q.includes('apparel') || q.includes('wear') || q.includes('shoes') || q.includes('sneaker')) {
    return {
      action: 'FILTER_CATEGORY',
      category: 'Fashion',
      reply: 'Filtering the catalog for Fashion & Apparel stores.'
    }
  }
  if (q.includes('luxury') || q.includes('watch') || q.includes('high end') || q.includes('rolex')) {
    // Check if specifically Rolex
    if (q.includes('rolex')) {
      const rolex = stores.find((s) => s.id === 'store-6')
      return {
        action: 'NAVIGATE_STORE',
        store: rolex,
        reply: 'Navigating you directly to Rolex Luxury Timepieces.'
      }
    }
    return {
      action: 'FILTER_CATEGORY',
      category: 'Luxury',
      reply: 'Showing our luxury timepiece and VIP retail collection.'
    }
  }
  if (q.includes('beauty') || q.includes('makeup') || q.includes('fragrance') || q.includes('cosmetics') || q.includes('sephora')) {
    if (q.includes('sephora')) {
      const sephora = stores.find((s) => s.id === 'store-8')
      return {
        action: 'NAVIGATE_STORE',
        store: sephora,
        reply: 'Escorting you to Sephora Beauty & Fragrance.'
      }
    }
    return {
      action: 'FILTER_CATEGORY',
      category: 'Beauty',
      reply: 'Showing Beauty & Fragrance boutiques in the directory.'
    }
  }
  if (q.includes('work zone') || q.includes('work') || q.includes('charging') || q.includes('laptop') || q.includes('wifi')) {
    if (q.includes('wifi') || q.includes('24/7') || q.includes('24 hours')) {
      return {
        action: 'ANSWER_QUERY',
        reply: 'Our Digital Workspace (Entrance Hall) and Zen Garden Lounge (Courtyard) are open 24/7 with free Wi-Fi 6 and USB-C charging hubs!'
      }
    }
    return {
      action: 'FILTER_CATEGORY',
      category: 'Work Zone',
      reply: 'Opening directory for quiet Work Zones and charging hubs.'
    }
  }

  // Action 5: Open / Close Directory Drawer
  if (q.includes('open directory') || q.includes('show directory') || q.includes('catalog') || q.includes('browse stores')) {
    return {
      action: 'TOGGLE_DIRECTORY',
      reply: 'Opening the Store Directory catalog drawer.'
    }
  }

  // Action 6: Direct Store Name Match
  for (const store of stores) {
    const nameLower = store.name.toLowerCase()
    if (q.includes(nameLower) || nameLower.includes(q)) {
      return {
        action: 'NAVIGATE_STORE',
        store,
        reply: `Certainly! Taking you directly to ${store.name}.`
      }
    }
  }

  // Action 7: Store Keyword Mappings
  const storeKeywords = [
    { kw: ['starbucks', 'coffee', 'espresso', 'pastry'], id: 'store-3', reply: 'Taking you to Starbucks Coffee & Bakery in the Entrance Hall.' },
    { kw: ['nike', 'sneakers', 'sports', 'activewear'], id: 'store-7', reply: 'Heading over to Nike Athletic Hub in the Exhibition Gallery.' },
    { kw: ['samsonite', 'luggage', 'bag', 'suitcase', 'backpack'], id: 'store-4', reply: 'Navigating to Samsonite Luggage & Travel.' },
    { kw: ['reception', 'help desk', 'customer service', 'flight status'], id: 'store-1', reply: 'Escorting you to the main Help Desk / Reception.' },
    { kw: ['digital art', 'exhibit', 'periodic table', 'science'], id: 'store-5', reply: 'Opening Digital Art Space exhibit.' },
    { kw: ['gelato', 'ice cream', 'affogato'], id: 'store-10', reply: 'Taking you to Artisan Gelato & Cafe in the Courtyard.' },
    { kw: ['garden cafe', 'organic', 'courtyard cafe'], id: 'store-9', reply: 'Navigating to Garden Café & Lounge in the Courtyard.' },
    { kw: ['zen garden', 'bamboo', 'relax', 'water feature'], id: 'store-11', reply: 'Escorting you to Zen Garden Lounge.' },
    { kw: ['souvenir', 'gift', 'heritage', 'chocolate', 'postcard'], id: 'store-12', reply: 'Taking you to Souvenir & Heritage Pavilion.' }
  ]

  for (const item of storeKeywords) {
    if (item.kw.some((k) => q.includes(k))) {
      const store = stores.find((s) => s.id === item.id)
      if (store) {
        return {
          action: 'NAVIGATE_STORE',
          store,
          reply: item.reply
        }
      }
    }
  }

  // Action 8: Scene Teleports
  if (q.includes('entrance') || q.includes('hall')) {
    const scene = scenes.find((s) => s.id === 'node-1')
    return {
      action: 'TELEPORT_SCENE',
      scene,
      reply: 'Teleporting to the Entrance Hall.'
    }
  }
  if (q.includes('gallery') || q.includes('exhibition')) {
    const scene = scenes.find((s) => s.id === 'node-2')
    return {
      action: 'TELEPORT_SCENE',
      scene,
      reply: 'Teleporting to the Main Exhibition Gallery.'
    }
  }
  if (q.includes('courtyard') || q.includes('outdoor')) {
    const scene = scenes.find((s) => s.id === 'node-3')
    return {
      action: 'TELEPORT_SCENE',
      scene,
      reply: 'Teleporting to the Outdoor Courtyard.'
    }
  }

  // Default Answer QA
  return {
    action: 'ANSWER_QUERY',
    reply: "Hello! I'm Aura, your AI Kiosk Concierge. You can ask me to open stores, filter dining or fashion, mute sound, reset the tour, or answer questions!"
  }
}
