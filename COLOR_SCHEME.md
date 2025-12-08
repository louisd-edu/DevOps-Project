# Color Scheme Documentation

This project uses a comprehensive color system with automatic light/dark mode support.

## Color Palettes

### 🟢 Primary Green

Main green palette for primary actions, highlights, and branding.

```html
<!-- Available shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 -->
<button class="bg-primary-500 hover:bg-primary-600 text-white">
  Primary Button
</button>
<div class="border-primary-300 text-primary-700">Primary Text</div>
```

**Example shades:**

- `primary-50` - #f0fdf4 (lightest)
- `primary-500` - #22c55e (default green)
- `primary-950` - #052e16 (darkest)

### 🍋 Accent Green (Lime)

Lime-green palette including your brand color (#cdea86 as accent-300).

```html
<!-- Available shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 -->
<div class="bg-accent-300 text-neutral-900">Your Brand Color</div>
<span class="text-accent-600">Accent Text</span>
```

**Example shades:**

- `accent-50` - #f7fee7 (lightest)
- `accent-300` - #cdea86 (your brand lime green)
- `accent-500` - #84cc16 (default lime)
- `accent-950` - #1a2e05 (darkest)

### ⚫ Neutral Grays

Complete grayscale for text, backgrounds, borders, and UI elements.

```html
<!-- Available shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 -->
<div class="bg-neutral-100 text-neutral-900">Light background</div>
<p class="text-neutral-600">Muted text</p>
<div class="border border-neutral-300">Bordered element</div>
```

**Example shades:**

- `neutral-50` - #f9fafb (almost white)
- `neutral-500` - #6b7280 (medium gray)
- `neutral-950` - #030712 (almost black)

## Dark Mode Support

### Automatic Dark Mode

The color scheme automatically responds to the user's system preference.

```css
/* Defined in src/app.css */
:root {
  background-color: var(--color-neutral-50); /* Light mode */
  color: var(--color-neutral-900);
}

@media (prefers-color-scheme: dark) {
  :root {
    background-color: var(--color-neutral-950); /* Dark mode */
    color: var(--color-neutral-50);
  }
}
```

### Manual Dark Mode Toggle

To manually toggle dark mode, add the `.dark` class to the `<html>` or `<body>` tag.

```svelte
<!-- Example dark mode toggle component -->
<script lang="ts">
  import { onMount } from 'svelte';

  let darkMode = $state(false);

  onMount(() => {
    // Check if user has a preference stored
    darkMode = localStorage.getItem('darkMode') === 'true';
    updateDarkMode();
  });

  function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode.toString());
    updateDarkMode();
  }

  function updateDarkMode() {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
</script>

<button onclick={toggleDarkMode}>
  {darkMode ? '☀️ Light' : '🌙 Dark'} Mode
</button>
```

## Usage Examples

### Buttons

```html
<!-- Primary button -->
<button
  class="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white px-4 py-2 rounded"
>
  Primary Action
</button>

<!-- Secondary button with accent color -->
<button
  class="bg-accent-300 hover:bg-accent-400 text-neutral-900 px-4 py-2 rounded"
>
  Secondary Action
</button>

<!-- Ghost button -->
<button
  class="border border-neutral-300 hover:bg-neutral-100 text-neutral-700 px-4 py-2 rounded"
>
  Ghost Button
</button>
```

### Cards

```html
<!-- Light card -->
<div class="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
  <h3 class="text-neutral-900 font-bold">Card Title</h3>
  <p class="text-neutral-600">Card description</p>
</div>

<!-- Colored card with accent -->
<div class="bg-accent-50 border border-accent-200 rounded-lg p-6">
  <h3 class="text-accent-900 font-bold">Highlighted Card</h3>
  <p class="text-accent-700">Important information</p>
</div>
```

### Forms

```html
<!-- Input field -->
<input
  type="text"
  class="bg-neutral-50 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 text-neutral-900 px-3 py-2 rounded"
  placeholder="Enter text..."
/>

<!-- Textarea -->
<textarea
  class="bg-neutral-50 border border-neutral-300 focus:border-primary-500 text-neutral-900 px-3 py-2 rounded w-full"
  rows="4"
></textarea>
```

### Status Indicators

```html
<!-- Success state -->
<div
  class="bg-primary-100 border border-primary-300 text-primary-800 px-4 py-2 rounded"
>
  ✓ Success message
</div>

<!-- Info state -->
<div
  class="bg-accent-100 border border-accent-300 text-accent-800 px-4 py-2 rounded"
>
  ℹ Info message
</div>

<!-- Neutral state -->
<div
  class="bg-neutral-100 border border-neutral-300 text-neutral-800 px-4 py-2 rounded"
>
  • Neutral message
</div>
```

### Badges

```html
<!-- Primary badge -->
<span
  class="inline-flex items-center bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
>
  Primary
</span>

<!-- Accent badge -->
<span
  class="inline-flex items-center bg-accent-300 text-neutral-900 text-xs px-2 py-1 rounded-full"
>
  Featured
</span>

<!-- Gray badge -->
<span
  class="inline-flex items-center bg-neutral-200 text-neutral-700 text-xs px-2 py-1 rounded-full"
>
  Default
</span>
```

## Color Philosophy

- **Primary Green**: Use for main actions, active states, and primary UI elements
- **Accent Lime**: Use for highlights, featured content, and secondary emphasis
- **Neutral Grays**: Use for text, backgrounds, borders, and structural elements
- **No Purple**: This color scheme intentionally avoids purple tones

## Migration Guide

If you have existing components using old color classes, here's how to migrate:

| Old Class          | New Class                           | Notes                          |
| ------------------ | ----------------------------------- | ------------------------------ |
| `bg-green-200`     | `bg-primary-200` or `bg-accent-200` | Choose based on usage          |
| `bg-green-300`     | `bg-primary-300` or `bg-accent-300` | accent-300 is your brand color |
| `text-gray-600`    | `text-neutral-600`                  | Direct replacement             |
| `border-slate-300` | `border-neutral-300`                | Consolidated to neutral        |
| `bg-slate-200`     | `bg-neutral-200`                    | Consolidated to neutral        |

## Customization

To customize colors, edit `/src/app.css` in the `@theme` block:

```css
@theme {
  /* Modify existing colors or add new ones */
  --color-primary-500: #your-color-here;
}
```

---

**Note**: All standard Tailwind colors (like `red`, `blue`, `yellow`, etc.) are still available if you need them for specific use cases.
