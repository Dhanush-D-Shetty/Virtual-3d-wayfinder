<template>
  <div ref="viewerContainer" class="viewer-container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  initViewer: {
    type: Function,
    required: true
  }
})

const viewerContainer = ref(null)

onMounted(() => {
  if (viewerContainer.value) {
    props.initViewer(viewerContainer.value)
  }
})
</script>
