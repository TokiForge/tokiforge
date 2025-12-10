<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { provideTheme } from '@tokiforge/vue';
import TokenEditor from './components/TokenEditor.vue';
import PreviewPane from './components/PreviewPane.vue';
import ExportDialog from './components/ExportDialog.vue';
import { TokenExporter } from '@tokiforge/core';

// Initial token configuration
const initialTokens = {
  color: {
    primary: { value: '#3b82f6', type: 'color' },
    secondary: { value: '#8b5cf6', type: 'color' },
    background: { value: '#ffffff', type: 'color' },
    text: { value: '#1f2937', type: 'color' },
    success: { value: '#10b981', type: 'color' },
    warning: { value: '#f59e0b', type: 'color' },
    error: { value: '#ef4444', type: 'color' },
  },
  spacing: {
    xs: { value: '0.25rem', type: 'dimension' },
    sm: { value: '0.5rem', type: 'dimension' },
    md: { value: '1rem', type: 'dimension' },
    lg: { value: '1.5rem', type: 'dimension' },
    xl: { value: '2rem', type: 'dimension' },
  },
  typography: {
    fontFamily: { value: 'Inter, sans-serif', type: 'fontFamily' },
    fontSizeBase: { value: '1rem', type: 'dimension' },
    fontSizeLg: { value: '1.125rem', type: 'dimension' },
    fontSizeXl: { value: '1.25rem', type: 'dimension' },
  },
  borderRadius: {
    sm: { value: '0.25rem', type: 'dimension' },
    md: { value: '0.5rem', type: 'dimension' },
    lg: { value: '1rem', type: 'dimension' },
  },
};

const tokens = ref(JSON.parse(JSON.stringify(initialTokens)));
const showExportDialog = ref(false);
const activeTab = ref<'editor' | 'preview'>('preview');

// Theme configuration
const config = computed(() => ({
  themes: [
    {
      name: 'playground',
      tokens: tokens.value,
    },
  ],
  defaultTheme: 'playground',
}));

// Provide theme
const themeContext = provideTheme(config.value);

// Watch for token changes and update theme
watch(tokens, async (newTokens) => {
  try {
    await themeContext.runtime.applyTheme('playground');
  } catch (e) {
    console.error('Failed to apply theme:', e);
  }
}, { deep: true });

const handleTokenUpdate = (updatedTokens: any) => {
  tokens.value = updatedTokens;
};

const handleExport = () => {
  showExportDialog.value = true;
};

const handleImport = (importedTokens: any) => {
  tokens.value = importedTokens;
};

const handleReset = () => {
  if (confirm('Reset to default tokens? This cannot be undone.')) {
    tokens.value = JSON.parse(JSON.stringify(initialTokens));
  }
};

// Load from localStorage on mount
const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem('tokiforge-playground-tokens');
    if (saved) {
      tokens.value = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load from storage:', e);
  }
};

// Save to localStorage
const saveToStorage = () => {
  try {
    localStorage.setItem('tokiforge-playground-tokens', JSON.stringify(tokens.value));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
};

// Auto-save on token changes
watch(tokens, saveToStorage, { deep: true });

// Load on mount
if (typeof window !== 'undefined') {
  loadFromStorage();
}
</script>

<template>
  <div class="playground">
    <div class="playground-header">
      <h1>Token Playground</h1>
      <p>Experiment with design tokens in real-time</p>
      
      <div class="header-actions">
        <button @click="handleReset" class="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M3 21v-5h5"></path>
          </svg>
          Reset
        </button>
        <button @click="handleExport" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export
        </button>
      </div>
    </div>

    <div class="playground-tabs">
      <button 
        :class="{ active: activeTab === 'preview' }"
        @click="activeTab = 'preview'"
      >
        Preview
      </button>
      <button 
        :class="{ active: activeTab === 'editor' }"
        @click="activeTab = 'editor'"
      >
        Editor
      </button>
    </div>

    <div class="playground-content">
      <div v-show="activeTab === 'preview'" class="preview-section">
        <PreviewPane />
      </div>

      <div v-show="activeTab === 'editor'" class="editor-section">
        <TokenEditor 
          :tokens="tokens" 
          @update:tokens="handleTokenUpdate"
        />
      </div>
    </div>

    <ExportDialog 
      v-if="showExportDialog"
      :tokens="tokens"
      @close="showExportDialog = false"
      @import="handleImport"
    />
  </div>
</template>

<style scoped>
.playground {
  min-height: 100vh;
  background: var(--vp-c-bg);
}

.playground-header {
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.playground-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.playground-header p {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-2);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.925rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.btn-primary {
  background: var(--vp-c-brand-1);
  color: white;
}

.btn-primary:hover {
  background: var(--vp-c-brand-2);
}

.btn-secondary {
  background: transparent;
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.btn-secondary:hover {
  background: var(--vp-c-default-soft);
  border-color: var(--vp-c-brand-1);
}

.playground-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 2rem 0;
  background: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
}

.playground-tabs button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.playground-tabs button:hover {
  color: var(--vp-c-text-1);
}

.playground-tabs button.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.playground-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.preview-section,
.editor-section {
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
