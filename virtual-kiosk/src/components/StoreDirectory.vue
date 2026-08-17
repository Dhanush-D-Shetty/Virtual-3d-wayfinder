<template>
  <Transition name="drawer-slide">
    <aside v-if="isOpen" class="store-directory-drawer">
      <!-- Drawer Header -->
      <div class="drawer-header">
        <div class="header-title">
          <Store :size="20" class="icon-cyan" />
          <div>
            <h2>Store & Wayfinding Catalog</h2>
            <p>{{ filteredStores.length }} Locations Available</p>
          </div>
        </div>
        <button class="close-drawer-btn" @click="$emit('close')">
          <X :size="20" />
        </button>
      </div>

      <!-- Search & Category Filters -->
      <div class="drawer-controls">
        <div class="search-box">
          <Search :size="16" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search stores, brands, dining..."
          />
          <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">
            <X :size="14" />
          </button>
        </div>

        <div class="category-pills">
          <button
            v-for="cat in categories"
            :key="cat"
            class="cat-pill"
            :class="{ active: selectedCategory === cat }"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Store Cards List -->
      <div class="store-list">
        <div
          v-for="store in filteredStores"
          :key="store.id"
          class="store-card"
          @click="$emit('select-store', store)"
        >
          <div class="card-thumb">
            <img :src="store.image" :alt="store.name" />
            <span :class="['card-badge', `badge-${store.badgeColor || 'cyan'}`]">
              {{ store.category }}
            </span>
          </div>

          <div class="card-details">
            <h3>{{ store.name }}</h3>
            <p class="store-room">📍 {{ getRoomName(store.nodeId) }}</p>
            <p class="store-hours">⏰ {{ store.hours }}</p>

            <button class="explore-btn">
              <Compass :size="14" /> Explore in 360°
            </button>
          </div>
        </div>

        <div v-if="filteredStores.length === 0" class="no-results">
          <SearchX :size="32" />
          <p>No stores found matching "{{ searchQuery }}"</p>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Store, X, Search, SearchX, Compass } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  stores: {
    type: Array,
    default: () => []
  },
  scenes: {
    type: Array,
    default: () => []
  },
  categoryFilter: {
    type: String,
    default: 'All'
  }
})

defineEmits(['close', 'select-store'])

const searchQuery = ref('')
const selectedCategory = ref('All')

watch(
  () => props.categoryFilter,
  (newCat) => {
    if (newCat) {
      selectedCategory.value = newCat
    }
  },
  { immediate: true }
)

defineExpose({
  selectedCategory,
  setCategory: (cat) => {
    selectedCategory.value = cat
  }
})

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
.store-directory-drawer {
  position: absolute;
  top: 90px;
  left: 24px;
  bottom: 24px;
  z-index: 50;
  width: 380px;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-cyan {
  color: #38bdf8;
}

.header-title h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f8fafc;
}

.header-title p {
  font-size: 0.75rem;
  color: #94a3b8;
}

.close-drawer-btn {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: #cbd5e1;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-drawer-btn:hover {
  background: rgba(239, 68, 68, 0.8);
  color: #fff;
}

.drawer-controls {
  padding: 16px 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 10px 36px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: #fff;
  font-size: 0.85rem;
  outline: none;
  transition: all 0.2s ease;
}

.search-box input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.category-pills {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.category-pills::-webkit-scrollbar {
  height: 3px;
}

.category-pills::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.cat-pill {
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cat-pill:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.cat-pill.active {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
  box-shadow: 0 0 10px rgba(2, 132, 199, 0.5);
}

.store-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.store-card {
  display: flex;
  gap: 12px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 12px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.store-card:hover {
  background: rgba(30, 41, 59, 0.85);
  border-color: rgba(56, 189, 248, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.card-thumb {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  font-size: 0.55rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 8px;
  color: #fff;
}

.badge-cyan { background: #0284c7; }
.badge-purple { background: #7c3aed; }
.badge-amber { background: #d97706; }
.badge-green { background: #16a34a; }

.card-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-details h3 {
  font-size: 0.92rem;
  font-weight: 700;
  color: #f8fafc;
}

.store-room,
.store-hours {
  font-size: 0.75rem;
  color: #94a3b8;
}

.explore-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
  margin-top: 4px;
  transition: all 0.2s ease;
}

.store-card:hover .explore-btn {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: #64748b;
  text-align: center;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: all 0.3s ease;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
