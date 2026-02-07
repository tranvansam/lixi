# Error Modal Design - Responsive UI

Error Modal với UI tối ưu cho cả Desktop và Mobile.

## 📱 Mobile UI

### Layout
- **Full screen modal** với toolbar
- **Centered content** với icon lớn
- **Bottom action button** (large size)
- **Vertical layout** tối ưu cho màn hình dọc

### Features
- ✅ Breakpoints: Full screen (100%)
- ✅ Icon size: 5rem (80px)
- ✅ Large touch-friendly button
- ✅ Vertical spacing tối ưu
- ✅ Title + Description centered
- ✅ Toolbar với close button

### Visual
```
┌──────────────────────┐
│  Error      [X]      │ ← Toolbar
├──────────────────────┤
│                      │
│        🔴           │ ← Large icon (5rem)
│                      │
│   Error Message      │ ← Title (1.5rem)
│                      │
│  Description text    │ ← Description
│  more details here   │
│                      │
│                      │
│  [    OK Button   ]  │ ← Large button (block)
│                      │
└──────────────────────┘
```

---

## 💻 Desktop UI

### Layout
- **Card-style modal** (480px width)
- **Header with close button** (right aligned)
- **Content section** với icon và text
- **Footer with action button**
- **Horizontal layout** tối ưu

### Features
- ✅ Fixed width: 480px (responsive)
- ✅ Rounded corners: 16px
- ✅ Box shadow: Elevated look
- ✅ Header/Content/Footer sections
- ✅ Icon size: 4rem (64px)
- ✅ Compact button in footer

### Visual
```
┌────────────────────────────────┐
│  Error                    [X]  │ ← Header with close
├────────────────────────────────┤
│                                │
│            🔴                  │ ← Icon (4rem)
│                                │
│       Error Message            │ ← Title (1.375rem)
│                                │
│    Description text here       │ ← Description (0.9375rem)
│                                │
├────────────────────────────────┤
│     [     OK Button     ]      │ ← Footer button
└────────────────────────────────┘
```

---

## 🎨 Design Tokens

### Colors (Dynamic)
- **Icon Color**: Based on error type
  - 4xx errors: `warning` (yellow/orange)
  - 5xx errors: `danger` (red)
- **Button Color**: `primary` (customizable)
- **Background**: 
  - Light mode: `#fff`
  - Dark mode: `#1e1e1e`

### Typography
| Element | Mobile | Desktop |
|---------|--------|---------|
| **Icon** | 5rem (80px) | 4rem (64px) |
| **Title** | 1.5rem (24px) | 1.375rem (22px) |
| **Description** | 1rem (16px) | 0.9375rem (15px) |
| **Button** | Large | Default (44px) |

### Spacing
| Element | Mobile | Desktop |
|---------|--------|---------|
| **Padding** | 2rem 1rem | 2rem 1.5rem |
| **Icon margin** | 1.5rem bottom | 1.5rem bottom |
| **Title margin** | 1rem bottom | 0.75rem bottom |
| **Footer padding** | - | 1rem 1.5rem |

### Layout
| Property | Mobile | Desktop |
|----------|--------|---------|
| **Width** | 100% | 480px |
| **Height** | 100% | Auto |
| **Border Radius** | 0 | 16px |
| **Box Shadow** | None | 0 10px 40px rgba(0,0,0,0.2) |

---

## 🔍 Responsive Breakpoints

```scss
// Mobile (default)
< 768px: Full screen modal

// Tablet
768px - 1024px: Card modal (420px width)

// Desktop
> 1024px: Card modal (480px width)

// Large Desktop
> 1440px: Card modal (520px width)
```

---

## 🌙 Dark Mode

### Automatic Support
- ✅ Uses CSS variables for colors
- ✅ Adapts to system preference
- ✅ Enhanced shadows in dark mode
- ✅ Border colors adjusted

### Dark Mode Changes
```scss
.error-modal--desktop {
  background: var(--ion-background-color, #1e1e1e);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.error-modal__header {
  background: var(--ion-color-step-50);
  border-bottom-color: var(--ion-color-step-100);
}
```

---

## 🎯 Detection Logic

### Platform Detection
```typescript
const isMobile = computed(() => {
  // 1. Check Ionic platform
  if (isPlatform('mobile') || isPlatform('mobileweb')) {
    return true;
  }
  
  // 2. Fallback: Check screen width
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768;
  }
  
  return false;
});
```

### Platforms Detected
- ✅ iOS (phone/tablet)
- ✅ Android (phone/tablet)
- ✅ Mobile web browsers
- ✅ Desktop (Windows/Mac/Linux)

---

## 📱 Usage Example

```vue
<ErrorModal
  :is-open="true"
  status-code="500"
  message="Internal Server Error"
  description="The server encountered an unexpected error"
  title="Error"
  button-text="OK"
  icon-color="danger"
  button-color="primary"
  @dismiss="handleDismiss"
/>
```

### Mobile Result
- Full screen takeover
- Large icon and text
- Bottom button

### Desktop Result
- Centered card modal
- Compact layout
- Header/Content/Footer sections

---

## 🎨 Customization

### Override Styles

```scss
// Custom width for desktop
.error-modal-desktop {
  --width: 600px; // Default: 480px
  --border-radius: 20px; // Default: 16px
}

// Custom mobile spacing
.error-modal--mobile {
  padding: 3rem 1.5rem; // Default: 2rem 1rem
}
```

### Custom Colors

```vue
<ErrorModal
  icon-color="warning"  // For 4xx errors
  button-color="danger" // Red button
  title="Custom Title"
  @dismiss="handleClose"
/>
```

---

## ✅ Accessibility

### Keyboard Support
- ✅ `Esc` key closes modal
- ✅ Tab navigation works
- ✅ Focus trap inside modal

### Screen Reader
- ✅ Proper ARIA labels
- ✅ Role="dialog"
- ✅ Announced when opened

### Touch Support
- ✅ Large touch targets (44px minimum)
- ✅ Swipe to dismiss (mobile)
- ✅ Backdrop dismiss

---

## 🚀 Performance

### Optimizations
- ✅ Conditional rendering (v-if for mobile/desktop)
- ✅ Computed detection (cached)
- ✅ CSS-only animations
- ✅ No JavaScript animations

### Load Time
- Instant on mobile/desktop
- No layout shift
- Smooth transitions

---

## 📊 Comparison Table

| Feature | Mobile | Desktop |
|---------|--------|---------|
| **Layout** | Full screen | Card (480px) |
| **Header** | Toolbar | Card header |
| **Icon** | 5rem | 4rem |
| **Content** | Centered vertical | Centered in card |
| **Button** | Large block | Default in footer |
| **Close** | Toolbar button | Header button |
| **Backdrop** | Yes | Yes |
| **Dismissible** | Yes | Yes |
| **Breakpoints** | N/A | Yes |
| **Shadow** | None | Elevated |
| **Corners** | Sharp | Rounded (16px) |

---

## 🎯 Best Practices

### Do's ✅
- Use appropriate icon colors (warning/danger)
- Keep messages concise
- Provide descriptions when needed
- Test on both mobile and desktop
- Support dark mode

### Don'ts ❌
- Don't use long messages
- Don't override platform detection
- Don't disable backdrop dismiss
- Don't use custom colors randomly
- Don't forget accessibility

---

## 🔄 Future Enhancements

- [ ] Custom animations per platform
- [ ] Haptic feedback on mobile
- [ ] Multiple action buttons
- [ ] Different modal sizes
- [ ] Toast alternative for minor errors
- [ ] Auto-dismiss timer option

---

Enjoy the responsive error modal! 🎉

