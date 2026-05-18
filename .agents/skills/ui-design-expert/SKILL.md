---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides the creation of distinctive, production-grade spatial frontend interfaces, codified directly from the visual systems and layout innovations built for the **Apple Vision Pro Spatial Plant Care Gateway**. It guards against generic "AI slop" layouts, enforcing state-of-the-art spatial glass composition and flawless mobile responsiveness.

---

## 🕶️ The Spatial Design Thinking

Before coding, commit to the bold, weightless, and layered aesthetic defined by this project:
- **Tone**: Hyper-futuristic Apple Vision OS passthrough. Layered frosted panels drifting in an active holographic space.
- **Purpose**: Bridge biological life-forms (plants/botanical elements) with cutting-edge software layers (Next.js, Supabase, Drizzle).
- **Differentiation**: Emphasize absolute Z-axis visual weightlessness, rich interactive gase spotlights, and ultra-high-end typography.

---

## 🎨 Spatial Aesthetics Guidelines

### 1. Spatial Glassmorphism & Z-Axis Layering
- **The Vision Glass System**: Translucent glass layers must use high saturation levels and heavy blurs to achieve clean backdrop light scattering:
  ```css
  .vision-glass {
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(28px) saturate(190%);
    -webkit-backdrop-filter: blur(28px) saturate(190%);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
  ```
- **Physical Inset Lighting**: Simulate physical spatial hardware borders using dual-inset highlights (a subtle white highlight at the top border, and a faint dark/muted highlight at the bottom):
  ```css
  box-shadow: 
    0 4px 30px rgba(0, 0, 0, 0.25),
    0 15px 40px -12px rgba(0, 0, 0, 0.45),
    inset 0 1px 1px rgba(255, 255, 255, 0.18),
    inset 0 -1px 1px rgba(255, 255, 255, 0.05);
  ```

### 2. High-Impact Custom Typography
- **Prohibit Generic Fonts**: Never default to generic, overused AI font stacks (like Inter, Roboto, Arial, or default system UI fonts).
- **Botanical / Futuristic Pairing**:
  - **Display / Headings**: Use a bold, highly-artistic, avant-garde display sans (like **Syne** or **Cabinet Grotesk**) or a refined serif (like **Cinzel**) to give titles extreme presence.
  - **UI / Body**: Pair with a clean, high-legibility modern geometric sans (like **Plus Jakarta Sans**) for all data layouts, meters, and notes.

### 3. Active Immersive Environments & Anti-Leak Controls
- **Organic Ambient Drifting**: Floating background light orbs must move along complex, multi-axis paths (shifting scale, translateY, and translateX) to feel organic and alive.
- **Anti-Leak Viewport Isolation**: To prevent negative coordinates of large ambient shapes (`left-[-150px]`) from triggering horizontal scrolling/width leaks on iOS Safari, wrap all background assets in a fixed pointer-events-none layer:
  ```html
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <!-- Ambient blurs go here -->
  </div>
  ```

### 4. Gaze-Spotlight Interaction (Cursor-Tracking)
- Track cursor coordinates (`--x`, `--y` custom CSS variables) driven by react mouse movements to overlay a subtle, moving white gaze-shine inside interactive cards:
  ```css
  .vision-spotlight::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle 120px at var(--x, 0px) var(--y, 0px), rgba(255, 255, 255, 0.08), transparent 80%);
    pointer-events: none;
  }
  ```

---

## 📱 Responsive & Mobile-First Best Practices

- **Synchronized Breakpoint Splits (`lg: 1024px`)**:
  - Coordinate transitions in layout grid columns and navigation sticky positions simultaneously at `lg` (1024px) to seamlessly support iPad Landscape, portrait, mobile, and wide desktop screens.
- **Pill Nav Collapsing**:
  - Under `1024px`, collapse left vertical navigation docks into floating horizontal bottom pill widgets (`w-[90%] max-w-[400px] h-16 rounded-full fixed bottom-6 left-1/2 -translate-x-1/2`).
- **Single-Pane Inline Forms**:
  - Avoid stacking popups or modals on top of active sliding bottom sheets on mobile devices.
  - Tapping "Log Care Action" must render the form **inline within the active sheet panel**, switching states instead of stacking overlays. This eliminates double-backdrop blurs, scroll-clashing, and mobile keyboard-clipping.
- **Fluid Layout Boundaries**:
  - Ensure filter panels and buttons use `overflow-x-auto scrollbar-none whitespace-nowrap` on compact viewports to prevent layout wrapping or overflow clipping.