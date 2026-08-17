<template>
  <div class="home-container">
    <!-- Hero Banner Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-pill">
          <span class="pill-dot"></span> LIVE INTERACTIVE KIOSK
        </div>
        <h1>Airport & Exhibition <span class="gradient-text">Wayfinding Kiosk</span></h1>
        <p>Explore 12+ premium stores, dining lounges, interactive science exhibits, and digital workspaces in immersive 360° spatial virtual reality.</p>

        <!-- Quick Stats -->
        <div class="hero-stats">
          <div class="stat-card">
            <span class="stat-val">12</span>
            <span class="stat-lbl">Stores & Lounges</span>
          </div>
          <div class="stat-card">
            <span class="stat-val">3</span>
            <span class="stat-lbl">Interactive Zones</span>
          </div>
          <div class="stat-card">
            <span class="stat-val">360°</span>
            <span class="stat-lbl">Spatial Tour</span>
          </div>
        </div>

        <button class="hero-cta-btn" @click="$emit('enter-360')">
          <Compass :size="20" /> Enter 360° Interactive Map
        </button>
      </div>
    </section>

    <!-- Store Directory Section -->
    <section class="catalog-section">
      <div class="section-header">
        <div>
          <h2>Explore Directory Stores</h2>
          <p>Select any store below to launch 360° location wayfinding instantly</p>
        </div>

        <!-- Search Bar -->
        <div class="home-search-box">
          <Search :size="18" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search stores, brands, dining..."
          />
          <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">
            <X :size="14" />
          </button>
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div class="home-category-pills">
        <button
          v-for="cat in categories"
          :key="cat"
          class="home-cat-pill"
          :class="{ active: selectedCategory === cat }"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Stores Cards Grid -->
      <div class="stores-grid">
        <div
          v-for="store in filteredStores"
          :key="store.id"
          class="home-store-card"
          @click="$emit('select-store', store)"
        >
          <div class="card-image-wrap">
            <img :src="store.image" :alt="store.name" />
            <span :class="['card-badge', `badge-${store.badgeColor || 'cyan'}`]">
              {{ store.category }}
            </span>
          </div>

          <div class="card-info-wrap">
            <h3>{{ store.name }}</h3>
            <p class="location-txt">📍 {{ getRoomName(store.nodeId) }}</p>
            <p class="hours-txt">⏰ {{ store.hours }}</p>
            <p class="desc-txt">{{ store.description }}</p>

            <button class="navigate-btn">
              <MapPin :size="16" /> Navigate in 360°
            </button>
          </div>
        </div>

        <div v-if="filteredStores.length === 0" class="no-results-box">
          <SearchX :size="40" />
          <p>No stores found matching "{{ searchQuery }}"</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Compass, Search, SearchX, MapPin, X } from 'lucide-vue-next'

const props = defineProps({
  stores: {
    type: Array,
    default: () => []
  },
  scenes: {
    type: Array,
    default: () => []
  }
})

defineEmits(['select-store', 'enter-360'])

const searchQuery = ref('')
const selectedCategory = ref('All')

const categories = [
  'All',
  'Information',
  'Dining',
  'Fashion',
  'Luxury',
  'Beauty',
  'Exhibit',
  'Work Zone'
]

const filteredStores = computed(() => {
  return props.stores.filter((store) => {
    const matchesCategory =
      selectedCategory.value === 'All' || store.category === selectedCategory.value

    const query = searchQuery.value.toLowerCase().trim()
    const matchesQuery =
      !query ||
      store.name.toLowerCase().includes(query) ||
      store.category.toLowerCase().includes(query) ||
      store.description.toLowerCase().includes(query)

    return matchesCategory && matchesQuery
  })
})

const getRoomName = (nodeId) => {
  const scene = props.scenes.find((s) => s.id === nodeId)
  return scene ? scene.name : nodeId
}
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100vh;
  padding: 115px 32px 60px;
  overflow-y: auto;
  box-sizing: border-box;
  background: radial-gradient(circle at 50% 0%, rgba(30, 58, 138, 0.3) 0%, rgba(3, 7, 18, 0.95) 70%);
}

/* Custom Sleek Scrollbar */
.home-container::-webkit-scrollbar {
  width: 8px;
}

.home-container::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.6);
}

.home-container::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.3);
  border-radius: 4px;
}

.home-container::-webkit-scrollbar-thumb:hover {
  background: rgba(56, 189, 248, 0.6);
}

/* Hero Section */
.hero-section {
  display: flex;
  justify-content: center;
  text-align: center;
  margin-bottom: 48px;
}

.hero-content {
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
  padding: 5px 14px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 10px #22c55e;
  animation: blink 1.5s infinite;
}

.hero-content h1 {
  font-size: 2.8rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #f8fafc;
  line-height: 1.2;
  margin-bottom: 16px;
}

.gradient-text {
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-content p {
  font-size: 1.1rem;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 28px;
}

/* Hero Stats */
.hero-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 12px 24px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.stat-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: #38bdf8;
}

.stat-lbl {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
}

.hero-cta-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 14px 32px;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
  transition: all 0.25s ease;
}

.hero-cta-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 14px 35px rgba(37, 99, 235, 0.6);
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
}

/* Catalog Section */
.catalog-section {
  max-width: 1300px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  gap: 20px;
}

.section-header h2 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #f8fafc;
}

.section-header p {
  font-size: 0.9rem;
  color: #94a3b8;
}

.home-search-box {
  position: relative;
  width: 320px;
  display: flex;
  align-items: center;
}

.home-search-box .search-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
}

.home-search-box input {
  width: 100%;
  padding: 12px 38px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
}

.home-search-box input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.3);
}

.home-category-pills {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.home-cat-pill {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-cat-pill:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.home-cat-pill.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
  box-shadow: 0 0 14px rgba(2, 132, 199, 0.5);
}

/* Stores Grid */
.stores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.home-store-card {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
}

.home-store-card:hover {
  transform: translateY(-6px);
  border-color: rgba(56, 189, 248, 0.5);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(56, 189, 248, 0.2);
}

.card-image-wrap {
  position: relative;
  height: 160px;
  width: 100%;
  overflow: hidden;
}

.card-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.home-store-card:hover .card-image-wrap img {
  transform: scale(1.08);
}

.card-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 12px;
  color: #fff;
}

.badge-cyan { background: #0284c7; box-shadow: 0 0 10px rgba(2, 132, 199, 0.6); }
.badge-purple { background: #7c3aed; box-shadow: 0 0 10px rgba(124, 58, 237, 0.6); }
.badge-amber { background: #d97706; box-shadow: 0 0 10px rgba(217, 119, 6, 0.6); }
.badge-green { background: #16a34a; box-shadow: 0 0 10px rgba(22, 163, 74, 0.6); }

.card-info-wrap {
  padding: 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-info-wrap h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 6px;
}

.location-txt,
.hours-txt {
  font-size: 0.8rem;
  color: #38bdf8;
  margin-bottom: 4px;
}

.desc-txt {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.4;
  margin-top: 8px;
  margin-bottom: 16px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.navigate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
  padding: 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-store-card:hover .navigate-btn {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
}

.no-results-box {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: #64748b;
  text-align: center;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
