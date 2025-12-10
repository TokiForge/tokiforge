<script setup lang="ts">
// Preview pane showing various UI components with current tokens
</script>

<template>
  <div class="preview-pane">
    <div class="preview-section">
      <h2>Colors</h2>
      <div class="color-grid">
        <div class="color-sample">
          <div class="color-box" style="background: var(--hf-color-primary)"></div>
          <span>Primary</span>
        </div>
        <div class="color-sample">
          <div class="color-box" style="background: var(--hf-color-secondary)"></div>
          <span>Secondary</span>
        </div>
        <div class="color-sample">
          <div class="color-box" style="background: var(--hf-color-success)"></div>
          <span>Success</span>
        </div>
        <div class="color-sample">
          <div class="color-box" style="background: var(--hf-color-warning)"></div>
          <span>Warning</span>
        </div>
        <div class="color-sample">
          <div class="color-box" style="background: var(--hf-color-error)"></div>
          <span>Error</span>
        </div>
      </div>
    </div>

    <div class="preview-section">
      <h2>Buttons</h2>
      <div class="button-grid">
        <button class="preview-btn preview-btn-primary">Primary Button</button>
        <button class="preview-btn preview-btn-secondary">Secondary Button</button>
        <button class="preview-btn preview-btn-success">Success Button</button>
        <button class="preview-btn preview-btn-warning">Warning Button</button>
        <button class="preview-btn preview-btn-error">Error Button</button>
      </div>
    </div>

    <div class="preview-section">
      <h2>Cards</h2>
      <div class="card-grid">
        <div class="preview-card">
          <h3>Card Title</h3>
          <p>This is a preview card using the current token values. Change tokens to see live updates!</p>
          <button class="preview-btn preview-btn-primary">Action</button>
        </div>
        <div class="preview-card">
          <h3>Another Card</h3>
          <p>Cards showcase spacing, border radius, and color tokens in action.</p>
          <button class="preview-btn preview-btn-secondary">Learn More</button>
        </div>
      </div>
    </div>

    <div class="preview-section">
      <h2>Typography</h2>
      <div class="typography-preview">
        <h1 style="font-family: var(--hf-typography-fontFamily); margin: 0 0 var(--hf-spacing-md) 0;">
          Heading 1
        </h1>
        <h2 style="font-family: var(--hf-typography-fontFamily); margin: 0 0 var(--hf-spacing-sm) 0;">
          Heading 2
        </h2>
        <p style="font-family: var(--hf-typography-fontFamily); font-size: var(--hf-typography-fontSizeBase); margin: 0 0 var(--hf-spacing-md) 0;">
          Body text using base font size. This demonstrates how typography tokens affect text rendering.
        </p>
        <p style="font-family: var(--hf-typography-fontFamily); font-size: var(--hf-typography-fontSizeLg); margin: 0;">
          Large text using the configured font size token.
        </p>
      </div>
    </div>

    <div class="preview-section">
      <h2>Spacing</h2>
      <div class="spacing-preview">
        <div class="spacing-box" style="padding: var(--hf-spacing-xs)">
          XS Padding
        </div>
        <div class="spacing-box" style="padding: var(--hf-spacing-sm)">
          SM Padding
        </div>
        <div class="spacing-box" style="padding: var(--hf-spacing-md)">
          MD Padding
        </div>
        <div class="spacing-box" style="padding: var(--hf-spacing-lg)">
          LG Padding
        </div>
        <div class="spacing-box" style="padding: var(--hf-spacing-xl)">
          XL Padding
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-pane {
  background: var(--hf-color-background);
  color: var(--hf-color-text);
  padding: var(--hf-spacing-xl);
  border-radius: var(--hf-borderRadius-lg);
  transition: all 0.3s ease;
}

.preview-section {
  margin-bottom: var(--hf-spacing-xl);
}

.preview-section:last-child {
  margin-bottom: 0;
}

.preview-section h2 {
  margin: 0 0 var(--hf-spacing-lg) 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--hf-color-text);
}

/* Colors */
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--hf-spacing-md);
}

.color-sample {
  text-align: center;
}

.color-box {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--hf-borderRadius-md);
  margin-bottom: var(--hf-spacing-sm);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.color-sample span {
  font-size: 0.875rem;
  color: var(--hf-color-text);
}

/* Buttons */
.button-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--hf-spacing-md);
}

.preview-btn {
  padding: var(--hf-spacing-sm) var(--hf-spacing-md);
  border: none;
  border-radius: var(--hf-borderRadius-md);
  font-size: var(--hf-typography-fontSizeBase);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-btn-primary {
  background: var(--hf-color-primary);
  color: white;
}

.preview-btn-secondary {
  background: var(--hf-color-secondary);
  color: white;
}

.preview-btn-success {
  background: var(--hf-color-success);
  color: white;
}

.preview-btn-warning {
  background: var(--hf-color-warning);
  color: white;
}

.preview-btn-error {
  background: var(--hf-color-error);
  color: white;
}

.preview-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Cards */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--hf-spacing-lg);
}

.preview-card {
  padding: var(--hf-spacing-lg);
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--hf-borderRadius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.preview-card h3 {
  margin: 0 0 var(--hf-spacing-sm) 0;
  color: var(--hf-color-text);
}

.preview-card p {
  margin: 0 0 var(--hf-spacing-md) 0;
  color: var(--hf-color-text);
  opacity: 0.8;
  line-height: 1.6;
}

/* Spacing */
.spacing-preview {
  display: flex;
  flex-direction: column;
  gap: var(--hf-spacing-md);
}

.spacing-box {
  background: var(--hf-color-primary);
  color: white;
  border-radius: var(--hf-borderRadius-sm);
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
