<script setup lang="ts">
import { ref, computed } from 'vue';
import { TokenExporter } from '@tokiforge/core';
import { useClipboard } from '@vueuse/core';

interface Props {
  tokens: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  import: [tokens: any];
}>();

type ExportFormat = 'css' | 'scss' | 'js' | 'ts' | 'json';

const activeTab = ref<'export' | 'import'>('export');
const selectedFormat = ref<ExportFormat>('css');
const importText = ref('');
const importError = ref('');

const exportedCode = computed(() => {
  try {
    return TokenExporter.export(props.tokens, {
      format: selectedFormat.value,
      selector: ':root',
      prefix: 'hf',
    });
  } catch (e) {
    return `// Error generating export: ${e}`;
  }
});

const { copy, copied } = useClipboard({ source: exportedCode });

const handleCopy = () => {
  copy(exportedCode.value);
};

const handleImport = () => {
  try {
    importError.value = '';
    const imported = JSON.parse(importText.value);
    emit('import', imported);
    emit('close');
  } catch (e) {
    importError.value = 'Invalid JSON format. Please check your input.';
  }
};

const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const imported = JSON.parse(content);
      emit('import', imported);
      emit('close');
    } catch (err) {
      importError.value = 'Failed to parse file. Please ensure it\'s valid JSON.';
    }
  };
  reader.readAsText(file);
};

const downloadFile = () => {
  const blob = new Blob([exportedCode.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tokens.${selectedFormat.value}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="export-dialog-overlay" @click="emit('close')">
    <div class="export-dialog" @click.stop>
      <div class="dialog-header">
        <h2>Export / Import Tokens</h2>
        <button class="close-btn" @click="emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="dialog-tabs">
        <button 
          :class="{ active: activeTab === 'export' }"
          @click="activeTab = 'export'"
        >
          Export
        </button>
        <button 
          :class="{ active: activeTab === 'import' }"
          @click="activeTab = 'import'"
        >
          Import
        </button>
      </div>

      <div v-if="activeTab === 'export'" class="dialog-content">
        <div class="format-selector">
          <label>Format:</label>
          <select v-model="selectedFormat">
            <option value="css">CSS Variables</option>
            <option value="scss">SCSS Variables</option>
            <option value="js">JavaScript</option>
            <option value="ts">TypeScript</option>
            <option value="json">JSON</option>
          </select>
        </div>

        <div class="code-preview">
          <pre><code>{{ exportedCode }}</code></pre>
        </div>

        <div class="dialog-actions">
          <button @click="handleCopy" class="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {{ copied ? 'Copied!' : 'Copy to Clipboard' }}
          </button>
          <button @click="downloadFile" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download File
          </button>
        </div>
      </div>

      <div v-else class="dialog-content">
        <div class="import-options">
          <div class="import-section">
            <h3>Paste JSON</h3>
            <textarea
              v-model="importText"
              placeholder="Paste your token JSON here..."
              rows="10"
              class="import-textarea"
            ></textarea>
            <p v-if="importError" class="error-message">{{ importError }}</p>
          </div>

          <div class="import-divider">OR</div>

          <div class="import-section">
            <h3>Import from File</h3>
            <label class="file-input-label">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Choose JSON File
              <input
                type="file"
                accept=".json"
                @change="handleFileImport"
                class="file-input"
              />
            </label>
          </div>
        </div>

        <div class="dialog-actions">
          <button @click="emit('close')" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="handleImport" class="btn btn-primary" :disabled="!importText">
            Import Tokens
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.export-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.export-dialog {
  background: var(--vp-c-bg);
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--vp-c-text-1);
}

.close-btn {
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}

.dialog-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 2rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.dialog-tabs button {
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

.dialog-tabs button:hover {
  color: var(--vp-c-text-1);
}

.dialog-tabs button.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.format-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.format-selector label {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.format-selector select {
  padding: 0.5rem 1rem;
  border: 2px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.95rem;
  cursor: pointer;
}

.code-preview {
  background: var(--vp-code-block-bg);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.code-preview pre {
  margin: 0;
}

.code-preview code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--vp-code-block-color);
}

.import-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.import-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
}

.import-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  resize: vertical;
}

.import-textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.error-message {
  margin-top: 0.5rem;
  color: var(--vp-c-red-1);
  font-size: 0.875rem;
}

.import-divider {
  text-align: center;
  color: var(--vp-c-text-3);
  font-weight: 500;
  position: relative;
}

.import-divider::before,
.import-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: var(--vp-c-divider);
}

.import-divider::before {
  left: 0;
}

.import-divider::after {
  right: 0;
}

.file-input-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border: 2px dashed var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.file-input-label:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.file-input {
  display: none;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--vp-c-brand-1);
  color: white;
}

.btn-primary:hover:not(:disabled) {
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

.btn svg {
  stroke-width: 2;
}
</style>
