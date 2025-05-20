<template>
  <div class="app-container">
    <Header />
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/navigation/Header.vue'
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
</style>
