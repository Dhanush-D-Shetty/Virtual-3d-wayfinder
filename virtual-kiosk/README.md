# 🌐 Interactive 360° Virtual Kiosk Tour Engine

An enterprise-grade, config-driven 360° virtual tour application built with **Vue 3**, **Photo Sphere Viewer 5**, and **Three.js**. Designed for touch kiosks, airport wayfinding, exhibition galleries, and spatial interactive displays.

---

## ✨ Features

- 🔄 **360° Panoramic Viewport**: High-performance WebGL spherical panorama renderer.
- 🚶 **Human Walking Animation**: Camera swiveling and head-bobbing footstep transition between nodes.
- 🤖 **AI Voice & Chat Assistant**: Intelligent assistant supporting text & real-time voice speech commands to navigate and open stores automatically.
- 🔑 **Free AI API Integration & Zero-Key Fallback**: Powered by Google Gemini API (Free tier) with a smart offline intent recognition engine when no API key is set.
- 📍 **3D Interactive Location Pins**: Floating badges for Information Desks, Exhibits, Amenities, and Points of Interest.
- 💎 **Glassmorphic Kiosk UI**: Sleek, high-contrast overlay optimized for 4K and portrait/landscape kiosk screens.
- ⚙️ **Config-Driven Architecture**: Add new rooms, markers, or links in a single configuration file without touching code logic.

---

## 🤖 AI Assistant Credentials Setup Guide

### 1. Free Google Gemini API Key
The AI Assistant natively supports **Google Gemini 1.5 Flash** (Free Tier with 15 requests/minute).

- Visit [Google AI Studio](https://aistudio.google.com/) and click **Get API key**.
- Create a free key (no credit card required).

### 2. How to Configure Your Credentials
You can configure your key in two easy ways:

#### Option A: `.env` Environment File (Recommended for Dev)
Create a `.env` file in the root folder of `virtual-kiosk`:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

#### Option B: Direct UI Settings (No Code Edit Needed)
1. Launch the app (`npm run dev`).
2. Click the **AI Assistant** button or floating FAB icon in the bottom right.
3. Click the **Settings (⚙️)** gear icon inside the chat header.
4. Paste your API key into the input field and click **Save Key**. The key will be stored securely in your browser's `localStorage`.

### 3. Smart Zero-Key Fallback Engine
Even if you do **NOT** provide an API key, the kiosk's built-in **Smart Intent Engine** automatically matches natural voice and text queries (e.g. *"I want coffee"*, *"Where can I buy shoes?"*, *"Take me to Rolex"*, *"Find luggage"*) using fuzzy matching and opens/navigates to the corresponding store!

---

## 📁 Directory & File Structure

```
virtual-kiosk/
├── public/
│   ├── room1.jpg              # Entrance Hall 360° Equirectangular Panorama
│   ├── room2.jpg              # Main Exhibition Gallery 360° Panorama
│   └── room3.jpg              # Outdoor Courtyard 360° Panorama
├── src/
│   ├── components/            # UI Components
│   │   ├── KioskHeader.vue    # Glassmorphic top navigation & brand header
│   │   └── VirtualTourViewer.vue # 360 Photo Sphere canvas container
│   ├── composables/           # Vue 3 Composables
│   │   └── useVirtualTour.js  # Reactive tour state, viewer lifecycle, event hooks
│   ├── config/                # Configuration Files
│   │   └── tourConfig.js      # Central tour nodes, image paths, links, markers
│   ├── styles/                # CSS Design System
│   │   └── kiosk.css          # Glassmorphism tokens, full-screen canvas styles
│   ├── utils/                 # Animation & Utility Modules
│   │   └── walkAnimation.js   # Standalone camera swivel & head-bob step animation
│   ├── App.vue                # Main application root component
│   └── main.js                # Application entry point
├── index.html                 # HTML template with mobile/kiosk viewport meta tags
├── package.json               # Dependencies and npm scripts
└── vite.config.js             # Vite bundler configuration
```

---

## 🛠️ Detailed File Responsibilities

| File Path | Description & Purpose | Primary Use Case |
| :--- | :--- | :--- |
| **`src/config/tourConfig.js`** | Central configuration file for tour nodes, panorama URLs, link arrows, and floating tags. | **Customization**: Add/edit rooms, panorama photos, link directions, and marker titles. |
| **`src/utils/walkAnimation.js`** | Helper function for smooth camera rotation and footstep head-bobbing transitions. | **Animation Tuning**: Adjust walking speed, tilt angle, and step intervals. |
| **`src/composables/useVirtualTour.js`** | Vue 3 composition hook managing Photo Sphere Viewer lifecycle and events. | **State Management**: Reactive current scene name, node switching, and reset triggers. |
| **`src/components/KioskHeader.vue`** | Top glassmorphic header overlay displaying room title, sub-label, and reset button. | **UI Overlay**: Modify header branding, icons, and action buttons. |
| **`src/components/VirtualTourViewer.vue`**| Pure Vue 3 wrapper component mounting the 360 viewer canvas element. | **Canvas Integration**: Encapsulates WebGL canvas container mounting. |
| **`src/styles/kiosk.css`** | Glassmorphism design tokens, full-screen wrapper rules, custom tag styling. | **Theme Styling**: Change colors, blur intensities, typography, and button effects. |
| **`src/App.vue`** | Root template connecting `KioskHeader` and `VirtualTourViewer`. | **Layout**: Top-level layout composition. |

---

## 🎨 Customization Guide

### 1. Adding a New Room / Scene
Open `src/config/tourConfig.js` and add a new node to the `tourNodes` array:

```javascript
{
  id: 'node-4',
  panorama: '/room4.jpg', // Place room4.jpg inside the /public directory
  name: 'VIP Lounge',
  links: [
    {
      nodeId: 'node-1',
      position: { pitch: -0.2, yaw: 1.57 } // Direction path back to Entrance
    }
  ],
  markers: [
    {
      id: 'tag-lounge',
      position: { pitch: 0.1, yaw: 0.5 },
      html: `<div class="custom-tag">
               <span class="tag-badge">VIP</span>
               <p class="tag-title">Exclusive Lounge</p>
             </div>`,
      anchor: 'bottom center'
    }
  ]
}
```

### 2. Tuning the Walking Animation
Edit options in `src/utils/walkAnimation.js` or pass custom parameters:

```javascript
await walkToNode(viewerInstance, virtualTourPlugin, targetNodeId, targetPosition, {
  totalSteps: 20,     // Number of footsteps (default: 16)
  stepInterval: 35,   // Time per step in ms (default: 40ms)
  bobAmount: 0.015,   // Head tilt angle up/down (default: 0.012)
  swivelSpeed: '1000ms' // Camera turn speed before walking
})
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-org/virtual-kiosk.git
   cd virtual-kiosk
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5175/` (or the port output in your terminal).

---

## 📦 Production Build & Deployment

### 1. Building for Production

Run the Vite build command to generate optimized static bundles in the `dist` directory:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

### 2. Deployment Options

#### Option A: Static Web Hosting (Vercel / Netlify / AWS S3 / Cloudflare Pages)
Upload the contents of the generated `dist/` folder to any static hosting provider.

#### Option B: NGINX Web Server
Copy `dist/*` to your NGINX html root directory (e.g. `/var/www/html/virtual-kiosk`) and add the NGINX location configuration:

```nginx
server {
    listen 80;
    server_name kiosk.yourdomain.com;

    root /var/www/html/virtual-kiosk;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static panorama assets aggressively
    location ~* \.(jpg|jpeg|png|svg|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

#### Option C: Kiosk Display Hardware Execution (Windows / Linux Kiosk Mode)
To launch the application automatically in full-screen kiosk mode on digital signage hardware:

- **Google Chrome Kiosk Mode Command**:
  ```bash
  chrome.exe --kiosk --no-errdialogs --disable-infobars --app=http://localhost:5175
  ```

---

## 📄 License
MIT License. Built for interactive 360° kiosk platforms.
