<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useClipboard } from '@vueuse/core';

interface Props {
  code: string;
  language?: 'vue' | 'javascript' | 'typescript' | 'html';
  title?: string;
  description?: string;
  showPreview?: boolean;
  editable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  language: 'vue',
  showPreview: true,
  editable: false,
});

const activeTab = ref<'code' | 'preview'>('preview');
const localCode = ref(props.code);
const { copy, copied } = useClipboard({ source: localCode });

const formattedCode = computed(() => {
  return localCode.value;
});

const handleCopy = () => {
  copy(localCode.value);
};
</script>

<template>
  <div class="live-example">
    <div v-if="title" class="live-example-header">
      <h3>{{ title }}</h3>
      <p v-if="description">{{ description }}</p>
    </div>

    <div class="live-example-tabs">
      <button
        v-if="showPreview"
        :class="{ active: activeTab === 'preview' }"
        @click="activeTab = 'preview'"
      >
        Preview
      </button>
      <button
        :class="{ active: activeTab === 'code' }"
        @click="activeTab = 'code'"
      >
        Code
      </button>
      <button class="copy-btn" @click="handleCopy" :title="copied ? 'Copied!' : 'Copy code'">
        <svg v-if="!copied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>
    </div>

    <div class="live-example-content">
      <div v-show="activeTab === 'preview' && showPreview" class="preview-pane">
        <slot name="preview">
          <!-- Preview content injected here -->
        </slot>
      </div>

      <div v-show="activeTab === 'code'" class="code-pane">
        <pre v-if="!editable"><code :class="`language-${language}`">{{ formattedCode }}</code></pre>
        <textarea
          v-else
          v-model="localCode"
          class="code-editor"
          spellcheck="false"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<style scoped>
.live-example {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 1.5rem 0;
}

.live-example-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.live-example-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.live-example-header p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.live-example-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  position: relative;
}

.live-example-tabs button {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.9rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.live-example-tabs button:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}

.live-example-tabs button.active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-default-soft);
  font-weight: 500;
}

.copy-btn {
  margin-left: auto !important;
}

.copy-btn svg {
  display: block;
}

.live-example-content {
  min-height: 200px;
}

.preview-pane {
  padding: 2rem;
  background: var(--vp-c-bg);
}

.code-pane {
  background: var(--vp-code-block-bg);
}

.code-pane pre {
  margin: 0;
  padding: 1.5rem;
  overflow-x: auto;
}

.code-pane code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--vp-code-block-color);
}

.code-editor {
  width: 100%;
  min-height: 300px;
  padding: 1.5rem;
  border: none;
  background: var(--vp-code-block-bg);
  color: var(--vp-code-block-color);
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  line-height: 1.7;
  resize: vertical;
}

.code-editor:focus {
  outline: none;
}
</style>
