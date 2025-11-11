<template>
  <div class="api-playground">
    <div class="playground-header">
      <h3>Interactive API Playground</h3>
      <div class="controls">
        <select v-model="selectedFormat" class="format-select">
          <option value="css">CSS</option>
          <option value="scss">SCSS</option>
          <option value="js">JavaScript</option>
          <option value="ts">TypeScript</option>
          <option value="json">JSON</option>
        </select>
        <button @click="copyOutput" class="copy-btn" :disabled="!output">
          {{ copied ? '✓ Copied!' : 'Copy' }}
        </button>
      </div>
    </div>

    <div class="playground-grid">
      <div class="editor-panel">
        <div class="panel-header">
          <h4>Tokens (JSON)</h4>
          <button @click="loadExample" class="example-btn">Load Example</button>
        </div>
        <textarea
          v-model="tokenJson"
          class="token-editor"
          placeholder='Enter your tokens in JSON format...'
          @input="updateOutput"
        ></textarea>
        <div v-if="error" class="error-message">{{ error }}</div>
      </div>

      <div class="preview-panel">
        <div class="panel-header">
          <h4>Output ({{ selectedFormat.toUpperCase() }})</h4>
        </div>
        <pre class="output-preview"><code>{{ output || '// Output will appear here...' }}</code></pre>
      </div>
    </div>

    <div v-if="hasValidTokens" class="live-preview">
      <div class="panel-header">
        <h4>Live Preview</h4>
      </div>
      <div class="preview-content" :style="previewStyles">
        <div class="preview-card">
          <h5>Sample Card</h5>
          <p>This is a preview of your tokens</p>
          <button class="preview-button">Button</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

const tokenJson = ref(`{
  "color": {
    "primary": { "value": "#7C3AED", "type": "color" },
    "secondary": { "value": "#06B6D4", "type": "color" },
    "background": { "value": "#FFFFFF", "type": "color" },
    "text": { "value": "#1F2937", "type": "color" }
  },
  "spacing": {
    "md": { "value": "16px", "type": "dimension" },
    "lg": { "value": "24px", "type": "dimension" }
  },
  "radius": {
    "md": { "value": "8px", "type": "dimension" }
  }
}`);

const selectedFormat = ref('css');
const output = ref('');
const error = ref('');
const copied = ref(false);

const exampleTokens = {
  basic: {
    color: {
      primary: { value: "#7C3AED", type: "color" },
      secondary: { value: "#06B6D4", type: "color" },
      background: { value: "#FFFFFF", type: "color" },
      text: { value: "#1F2937", type: "color" }
    }
  },
  complete: {
    color: {
      primary: { value: "#7C3AED", type: "color" },
      secondary: { value: "#06B6D4", type: "color" },
      background: { value: "#FFFFFF", type: "color" },
      text: { value: "#1F2937", type: "color" }
    },
    spacing: {
      xs: { value: "4px", type: "dimension" },
      sm: { value: "8px", type: "dimension" },
      md: { value: "16px", type: "dimension" },
      lg: { value: "24px", type: "dimension" },
      xl: { value: "32px", type: "dimension" }
    },
    radius: {
      sm: { value: "4px", type: "dimension" },
      md: { value: "8px", type: "dimension" },
      lg: { value: "12px", type: "dimension" }
    },
    typography: {
      fontFamily: {
        sans: { value: "Inter, sans-serif", type: "string" }
      },
      fontSize: {
        sm: { value: "14px", type: "dimension" },
        base: { value: "16px", type: "dimension" },
        lg: { value: "18px", type: "dimension" },
        xl: { value: "20px", type: "dimension" }
      }
    }
  }
};

const tokens = computed(() => {
  try {
    return JSON.parse(tokenJson.value);
  } catch (e) {
    return null;
  }
});

const hasValidTokens = computed(() => {
  return tokens.value && !error.value;
});

const previewStyles = computed(() => {
  if (!hasValidTokens.value) return {};
  
  const t = tokens.value;
  return {
    '--color-primary': t.color?.primary?.value || '#7C3AED',
    '--color-secondary': t.color?.secondary?.value || '#06B6D4',
    '--color-background': t.color?.background?.value || '#FFFFFF',
    '--color-text': t.color?.text?.value || '#1F2937',
    '--spacing-md': t.spacing?.md?.value || '16px',
    '--spacing-lg': t.spacing?.lg?.value || '24px',
    '--radius-md': t.radius?.md?.value || '8px',
  };
});

const updateOutput = async () => {
  error.value = '';
  output.value = '';

  try {
    if (!tokenJson.value.trim()) {
      output.value = '// Enter tokens to see output...';
      return;
    }

    const parsed = JSON.parse(tokenJson.value);
    
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Tokens must be an object');
    }
    
    // Dynamically import @tokiforge/core
    const { TokenExporter } = await import('@tokiforge/core');
    
    switch (selectedFormat.value) {
      case 'css':
        output.value = TokenExporter.exportCSS(parsed, {
          selector: ':root',
          prefix: 'hf',
        });
        break;
      case 'scss':
        output.value = TokenExporter.exportSCSS(parsed, {
          prefix: 'hf',
        });
        break;
      case 'js':
        output.value = TokenExporter.exportJS(parsed, {});
        break;
      case 'ts':
        output.value = TokenExporter.exportTS(parsed);
        break;
      case 'json':
        output.value = JSON.stringify(parsed, null, 2);
        break;
    }
  } catch (e: any) {
    error.value = e.message || 'Invalid JSON or token structure';
    output.value = '';
  }
};

const loadExample = () => {
  tokenJson.value = JSON.stringify(exampleTokens.complete, null, 2);
  updateOutput();
};

const copyOutput = async () => {
  if (!output.value) return;
  
  try {
    await navigator.clipboard.writeText(output.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (e) {
    console.error('Failed to copy:', e);
  }
};

watch(selectedFormat, updateOutput);
watch(tokenJson, updateOutput);

onMounted(() => {
  updateOutput();
});
</script>

<style scoped>
.api-playground {
  margin: 2rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.playground-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.playground-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.format-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  cursor: pointer;
}

.copy-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-brand);
  border-radius: 6px;
  background: var(--vp-c-brand);
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-dark);
  border-color: var(--vp-c-brand-dark);
}

.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.playground-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  min-height: 400px;
}

.editor-panel,
.preview-panel {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--vp-c-divider);
}

.preview-panel {
  border-right: none;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.panel-header h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-2);
}

.example-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.example-btn:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand);
}

.token-editor {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.output-preview {
  flex: 1;
  margin: 0;
  padding: 1rem 1.5rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
}

.output-preview code {
  color: var(--vp-c-text-1);
}

.error-message {
  padding: 0.75rem 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  font-size: 0.875rem;
  border-top: 1px solid var(--vp-c-divider);
}

.live-preview {
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.preview-content {
  padding: 2rem;
  background: var(--color-background, #FFFFFF);
  color: var(--color-text, #1F2937);
}

.preview-card {
  max-width: 400px;
  padding: var(--spacing-lg, 24px);
  background: white;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-card h5 {
  margin: 0 0 0.5rem 0;
  color: var(--color-primary, #7C3AED);
  font-size: 1.25rem;
}

.preview-card p {
  margin: 0 0 1rem 0;
  color: var(--color-text, #1F2937);
}

.preview-button {
  padding: 0.5rem 1rem;
  background: var(--color-primary, #7C3AED);
  color: white;
  border: none;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.preview-button:hover {
  background: var(--color-secondary, #06B6D4);
}

@media (max-width: 768px) {
  .playground-grid {
    grid-template-columns: 1fr;
  }
  
  .editor-panel,
  .preview-panel {
    border-right: none;
    border-bottom: 1px solid var(--vp-c-divider);
  }
  
  .preview-panel {
    border-bottom: none;
  }
}
</style>

