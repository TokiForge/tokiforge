<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  color: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:color': [color: string];
}>();

const localColor = ref(props.color);
const showPicker = ref(false);

watch(() => props.color, (newColor) => {
  localColor.value = newColor;
});

const handleColorChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  localColor.value = target.value;
  emit('update:color', target.value);
};

const togglePicker = () => {
  showPicker.value = !showPicker.value;
};
</script>

<template>
  <div class="color-picker">
    <button 
      class="color-swatch"
      :style="{ background: localColor }"
      @click="togglePicker"
      :title="`Click to change color: ${localColor}`"
    >
      <input 
        v-if="showPicker"
        type="color"
        :value="localColor"
        @input="handleColorChange"
        @blur="showPicker = false"
        ref="colorInput"
        class="color-input"
      />
    </button>
  </div>
</template>

<style scoped>
.color-picker {
  position: relative;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border: 2px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.color-swatch:hover {
  border-color: var(--vp-c-brand-1);
  transform: scale(1.1);
}

.color-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  cursor: pointer;
  opacity: 0;
}
</style>
