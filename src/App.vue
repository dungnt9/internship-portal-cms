<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/default.vue'
import EmptyLayout from '@/layouts/empty.vue'

const route = useRoute()

const layout = computed(() => {
  return route.meta.layout === 'empty' ? EmptyLayout : DefaultLayout
})
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<style scoped></style>
