<template>
  <div class="overlay">
    <div class="modal-box">
      <h3>Xác nhận đăng xuất</h3>
      <p>Bạn có chắc chắn muốn đăng xuất không?</p>
      <div class="actions">
        <button @click="emit('close')">Hủy</button>
        <button @click="emit('confirm')">Đăng xuất</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['confirm', 'close'])
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8); /* Tăng độ tối để làm nổi bật modal */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out; /* Hiệu ứng fade-in */
}

.modal-box {
  background: #ffffff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); /* Đổ bóng hiện đại */
  max-width: 400px;
  width: 90%;
  text-align: center;
  animation: slideIn 0.3s ease-in-out; /* Hiệu ứng slide-in */
}

.modal-box h3 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333333;
  margin-bottom: 15px;
}

.modal-box p {
  font-size: 1rem;
  color: #555555;
  margin-bottom: 25px;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.actions button {
  flex: 1;
  padding: 10px 15px;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.actions button:first-child {
  background: #f0f0f0;
  color: #333333;
}

.actions button:first-child:hover {
  background: #e0e0e0;
}

.actions button:last-child {
  background: #ff4d4f;
  color: #ffffff;
}

.actions button:last-child:hover {
  background: #e63946;
}

/* Hiệu ứng fade-in cho overlay */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Hiệu ứng slide-in cho modal */
@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
