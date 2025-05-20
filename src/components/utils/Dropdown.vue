<template>
  <div class="dropdown">
    <ul>
      <li
        v-for="(item, index) in items"
        :key="index"
        @click="handleClick(item)"
        class="dropdown-item"
      >
        {{ item.label }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const handleClick = (item) => {
  if (item.action) {
    item.action()
  } else if (item.route) {
    window.location.href = item.route
  }
}
</script>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: 'Arial', sans-serif;
}

.dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dropdown-item {
  cursor: pointer;
  padding: 12px 16px;
  background-color: #fff;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
}

.dropdown-item:hover {
  background-color: #007bff;
  color: #fff;
}

.dropdown-item:active {
  background-color: #0056b3;
}

.dropdown-item + .dropdown-item {
  border-top: 1px solid #eee;
}

.dropdown:hover {
  border-color: #007bff;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}
</style>
