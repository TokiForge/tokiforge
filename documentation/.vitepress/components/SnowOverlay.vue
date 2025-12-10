<template>
  <div v-if="showSnow" class="snow-overlay" aria-hidden="true">
    <div
      v-for="i in snowflakeCount"
      :key="i"
      class="snowflake"
      :style="getSnowflakeStyle(i)"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const snowflakeCount = 50;
const showSnow = ref(false);

// Check if it's December (Christmas season)
const isDecember = computed(() => {
  const now = new Date();
  return now.getMonth() === 11; // December is month 11 (0-indexed)
});

// Show snow only in December
onMounted(() => {
  showSnow.value = isDecember.value;
});

// Generate random style for each snowflake
const getSnowflakeStyle = (index: number) => {
  const left = Math.random() * 100;
  const animationDelay = Math.random() * 5;
  const animationDuration = 10 + Math.random() * 10;
  const size = 4 + Math.random() * 4;
  const opacity = 0.5 + Math.random() * 0.5;
  
  return {
    left: `${left}%`,
    animationDelay: `${animationDelay}s`,
    animationDuration: `${animationDuration}s`,
    width: `${size}px`,
    height: `${size}px`,
    opacity: opacity.toString(),
  };
};
</script>

<style scoped>
.snow-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.snowflake {
  position: absolute;
  top: -10px;
  background: white;
  border-radius: 50%;
  pointer-events: none;
  animation: snowfall linear infinite;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
}

@keyframes snowfall {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: translateY(50vh) translateX(20px) rotate(180deg);
    opacity: 0.8;
  }
  100% {
    transform: translateY(100vh) translateX(-20px) rotate(360deg);
    opacity: 0;
  }
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  .snowflake {
    animation: none;
  }
}
</style>

