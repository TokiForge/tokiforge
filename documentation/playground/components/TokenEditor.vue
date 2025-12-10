<script setup lang="ts">
import { ref, computed } from 'vue';
import ColorPicker from './ColorPicker.vue';

interface Props {
  tokens: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:tokens': [tokens: any];
}>();

const expandedSections = ref<Set<string>>(new Set(['color']));
const editingToken = ref<string | null>(null);
const editValue = ref('');

const toggleSection = (section: string) => {
  if (expandedSections.value.has(section)) {
    expandedSections.value.delete(section);
  } else {
    expandedSections.value.add(section);
  }
};

const startEdit = (path: string, currentValue: string) => {
  editingToken.value = path;
  editValue.value = currentValue;
};

const saveEdit = () => {
  if (!editingToken.value) return;
  
  const updated = JSON.parse(JSON.stringify(props.tokens));
  const parts = editingToken.value.split('.');
  let current = updated;
  
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
  }
  
  current[parts[parts.length - 1]].value = editValue.value;
  emit('update:tokens', updated);
  editingToken.value = null;
};

const cancelEdit = () => {
  editingToken.value = null;
  editValue.value = '';
};

const updateColorToken = (path: string, color: string) => {
  const updated = JSON.parse(JSON.stringify(props.tokens));
  const parts = path.split('.');
  let current = updated;
  
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
  }
  
  current[parts[parts.length - 1]].value = color;
  emit('update:tokens', updated);
};

const getTokenType = (token: any): string => {
  return token.type || 'custom';
};

const isColorToken = (token: any): boolean => {
  return token.type === 'color' || (typeof token.value === 'string' && token.value.startsWith('#'));
};
</script>

<template>
  <div class="token-editor">
    <div v-for="(section, sectionKey) in tokens" :key="sectionKey" class="token-section">
      <button 
        class="section-header"
        @click="toggleSection(sectionKey as string)"
      >
        <svg 
          class="expand-icon"
          :class="{ expanded: expandedSections.has(sectionKey as string) }"
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
        <span class="section-name">{{ sectionKey }}</span>
        <span class="token-count">
          {{ Object.keys(section).length }} tokens
        </span>
      </button>

      <div v-if="expandedSections.has(sectionKey as string)" class="section-content">
        <div 
          v-for="(token, tokenKey) in section" 
          :key="tokenKey"
          class="token-item"
        >
          <div class="token-info">
            <div class="token-name">{{ tokenKey }}</div>
            <div class="token-type">{{ getTokenType(token) }}</div>
          </div>

          <div class="token-value">
            <div v-if="editingToken === `${sectionKey}.${tokenKey}`" class="token-edit">
              <input 
                v-model="editValue"
                type="text"
                class="token-input"
                @keyup.enter="saveEdit"
                @keyup.esc="cancelEdit"
                autofocus
              />
              <button @click="saveEdit" class="btn-save">✓</button>
              <button @click="cancelEdit" class="btn-cancel">✕</button>
            </div>

            <div v-else class="token-display">
              <ColorPicker
                v-if="isColorToken(token)"
                :color="token.value"
                @update:color="updateColorToken(`${sectionKey}.${tokenKey}`, $event)"
              />
              
              <code class="token-value-text">{{ token.value }}</code>
              
              <button 
                @click="startEdit(`${sectionKey}.${tokenKey}`, token.value)"
                class="btn-edit"
                title="Edit token"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.token-editor {
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  overflow: hidden;
}

.token-section {
  border-bottom: 1px solid var(--vp-c-divider);
}

.token-section:last-child {
  border-bottom: none;
}

.section-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.section-header:hover {
  background: var(--vp-c-default-soft);
}

.expand-icon {
  transition: transform 0.2s;
  stroke-width: 2;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.section-name {
  flex: 1;
  text-align: left;
  text-transform: capitalize;
}

.token-count {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--vp-c-text-2);
}

.section-content {
  padding: 0.5rem 1.5rem 1rem 3rem;
}

.token-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: var(--vp-c-bg);
  border-radius: 6px;
  transition: all 0.2s;
}

.token-item:hover {
  background: var(--vp-c-bg-soft);
}

.token-info {
  flex: 1;
}

.token-name {
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-bottom: 0.25rem;
}

.token-type {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.token-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.token-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.token-value-text {
  padding: 0.375rem 0.75rem;
  background: var(--vp-code-block-bg);
  color: var(--vp-c-brand-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  border-radius: 4px;
  min-width: 120px;
}

.token-edit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.token-input {
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--vp-c-brand-1);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  min-width: 200px;
}

.token-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-2);
}

.btn-edit,
.btn-save,
.btn-cancel {
  padding: 0.375rem;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-edit:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.btn-save {
  color: var(--vp-c-green-1);
  font-size: 1.25rem;
  font-weight: 700;
}

.btn-save:hover {
  background: var(--vp-c-green-soft);
}

.btn-cancel {
  color: var(--vp-c-red-1);
  font-size: 1.25rem;
  font-weight: 700;
}

.btn-cancel:hover {
  background: var(--vp-c-red-soft);
}
</style>
