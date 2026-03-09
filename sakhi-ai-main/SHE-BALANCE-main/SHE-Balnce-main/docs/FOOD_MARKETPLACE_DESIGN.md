# 🎨 Food Marketplace - Artisanal Design System

## Design Philosophy
The SheBalance Food Marketplace embodies a **warm, rustic, and artisanal aesthetic** that celebrates homemade goodness and traditional craftsmanship. The design creates a premium, handcrafted feel while maintaining modern usability.

---

## 🎨 Color Palette

### Primary Colors
```css
--cream: #F5F5DC        /* Background, soft and warm */
--beige: #E8DCC4        /* Secondary background, subtle accents */
--deep-brown: #4B3621   /* Primary text, buttons, headings */
--chocolate: #6B4423    /* Secondary text, hover states */
--terracotta: #C97D60   /* Accent color, ratings, highlights */
--wheat: #D4A574        /* Gradient accents, borders */
```

### Color Usage
- **Backgrounds**: Cream (#F5F5DC) for main areas, Beige (#E8DCC4) for cards
- **Text**: Deep Brown (#4B3621) for headings, Chocolate (#6B4423) for body
- **Accents**: Terracotta (#C97D60) for stars, highlights, and CTAs
- **Gradients**: Beige to Wheat for hero sections

---

## 📝 Typography

### Font Families
```css
/* Headings - Elegant Serif */
font-family: 'Playfair Display', serif;

/* Body Text - Clean Sans-Serif */
font-family: 'Inter', sans-serif;
```

### Type Scale
- **Hero Title**: 3.5rem, Playfair Display, Bold (700)
- **Section Headings**: 2.5rem, Playfair Display, Bold (700)
- **Card Titles**: 1.5rem, Playfair Display, Bold (700)
- **Body Text**: 1rem, Inter, Regular (400)
- **Small Text**: 0.95rem, Inter, Medium (500)

### Typography Rules
- Use **Playfair Display** for all headings and prices (creates premium feel)
- Use **Inter** for body text, descriptions, and UI elements (ensures readability)
- Letter spacing: -0.5px to -1px for large headings (tighter, more elegant)
- Line height: 1.5-1.6 for body text (comfortable reading)

---

## 🎭 Visual Elements

### Shapes & Borders
- **Border Radius**: 
  - Cards: 20-25px (soft, organic feel)
  - Buttons: 50px (pill-shaped, friendly)
  - Inputs: 15px (subtle rounding)
  - Images: 25px top corners (arch-like effect)

### Shadows
```css
/* Subtle elevation */
box-shadow: 0 4px 15px rgba(75, 54, 33, 0.08);

/* Hover state */
box-shadow: 0 12px 30px rgba(75, 54, 33, 0.15);

/* Prominent elements */
box-shadow: 0 8px 30px rgba(75, 54, 33, 0.15);
```

### Spacing
- **Wide margins**: 80px vertical padding for sections
- **Generous gaps**: 25-35px between cards
- **Breathing room**: 20-30px padding inside cards
- **Minimal clutter**: Plenty of white (cream) space

---

## 🖼️ Imagery Style

### Photography Guidelines
- **Lighting**: Warm, natural morning light
- **Composition**: Minimalist, focused on the food
- **Background**: Rustic wooden tables, neutral surfaces
- **Texture**: High-quality, tactile feel
- **Saturation**: Warm tones, slightly enhanced
- **Contrast**: Soft shadows, not harsh

### Image Placeholders
- Use large emoji icons (5rem) with gradient backgrounds
- Gradients: Wheat to Terracotta
- Add subtle radial gradient overlay for depth

### Decorative Elements
- Large, ghosted emoji in background (opacity: 0.05)
- Wheat/grain line-art illustrations
- Arch-shaped image masks (future enhancement)

---

## 🎯 UI Components

### Buttons

#### Primary Button
```css
background: var(--deep-brown);
color: white;
padding: 14-18px 28-35px;
border-radius: 50px;
font-weight: 600;
transition: all 0.3s;
```

**Hover State**:
```css
background: var(--chocolate);
transform: translateY(-2px);
box-shadow: 0 5px 15px rgba(75, 54, 33, 0.3);
```

#### Secondary Button
```css
background: var(--beige);
color: var(--deep-brown);
border-radius: 50px;
```

### Cards

#### Food Item Card
- Background: Cream (#F5F5DC)
- Border: 2px transparent (Wheat on hover)
- Border radius: 25px
- Padding: 25px
- Shadow: Subtle brown shadow
- Hover: Lift 8px, increase shadow

#### Category Card
- Background: White
- Border radius: 20px
- Padding: 35px 20px
- Center-aligned content
- Icon size: 3.5rem
- Hover: Lift 8px, Terracotta border

### Forms

#### Input Fields
```css
background: var(--cream);
border: 2px solid var(--beige);
border-radius: 15px;
padding: 14px 20px;
color: var(--deep-brown);
```

**Focus State**:
```css
border-color: var(--chocolate);
background: white;
```

### Modals
- Border radius: 25px
- Backdrop: rgba(75, 54, 33, 0.6) with blur
- Shadow: 0 15px 50px rgba(75, 54, 33, 0.3)
- Header border: 2px solid Beige
- Close button: Rotates 90° on hover

---

## ✨ Animations & Transitions

### Standard Transitions
```css
transition: all 0.3s ease;
```

### Cubic Bezier (Smooth)
```css
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
```

### Hover Effects
- **Cards**: translateY(-8px)
- **Buttons**: translateY(-2px)
- **Close button**: rotate(90deg)

### Entrance Animations
- **Modals**: slideUp from bottom
- **Notifications**: slideIn from right
- **Page load**: fadeIn

---

## 🎪 Layout Patterns

### Grid Systems
```css
/* Food Items */
grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
gap: 35px;

/* Categories */
grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
gap: 25px;
```

### Container Widths
- Max width: 1200px
- Centered with auto margins
- Padding: 20px horizontal

---

## 🌟 Brand Voice in Design

### Visual Tone
- **Warm**: Earth tones, soft shadows
- **Artisanal**: Handcrafted feel, organic shapes
- **Premium**: Elegant typography, generous spacing
- **Approachable**: Friendly rounded corners, clear hierarchy
- **Trustworthy**: Professional layout, consistent styling

### Design Principles
1. **Minimalism**: Less is more, focus on content
2. **Warmth**: Use earth tones throughout
3. **Elegance**: Serif headings, proper spacing
4. **Clarity**: Clear hierarchy, readable text
5. **Delight**: Smooth animations, thoughtful interactions

---

## 📱 Responsive Considerations

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile Adjustments
- Reduce font sizes by 20-30%
- Single column layouts
- Increase touch targets (min 44px)
- Simplify navigation
- Stack cards vertically

---

## 🎨 AI Image Generation Prompts

### For Food Photography
```
Professional food photography of [FOOD ITEM], warm natural lighting, 
rustic wooden table, minimalist composition, soft shadows, 
artisanal bakery style, high quality textures, 8k resolution, 
morning light, earth tones --ar 16:9
```

### For Hero Backgrounds
```
Warm minimalist background with subtle wheat grain pattern, 
cream and beige tones, soft texture, artisanal aesthetic, 
professional bakery style, high resolution --ar 21:9
```

### For Chef Portraits
```
Portrait of [DESCRIPTION] woman chef, warm natural lighting, 
rustic kitchen background, professional yet approachable, 
soft focus background, earth tones, artisanal aesthetic --ar 1:1
```

---

## 🔧 Implementation Notes

### CSS Variables
Always use CSS variables for colors to maintain consistency:
```css
:root {
    --cream: #F5F5DC;
    --beige: #E8DCC4;
    --deep-brown: #4B3621;
    --chocolate: #6B4423;
    --terracotta: #C97D60;
    --wheat: #D4A574;
}
```

### Font Loading
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### Accessibility
- Maintain 4.5:1 contrast ratio for text
- Use semantic HTML
- Include ARIA labels
- Ensure keyboard navigation
- Test with screen readers

---

## 🎯 Future Enhancements

### Visual Improvements
- [ ] Arch-shaped image masks for food photos
- [ ] Subtle line-art wheat illustrations in backgrounds
- [ ] Custom food photography with consistent style
- [ ] Animated grain/wheat patterns
- [ ] Parallax scrolling effects

### Interactive Elements
- [ ] Hover preview of food items
- [ ] Smooth page transitions
- [ ] Loading animations with wheat icon
- [ ] Success animations with confetti
- [ ] Micro-interactions on buttons

---

## 📚 Design References

### Inspiration Sources
- Artisanal bakery websites
- Premium food delivery apps
- Handcrafted marketplace platforms
- Minimalist e-commerce sites
- Rustic restaurant branding

### Similar Aesthetics
- Canva food marketplace templates
- Etsy handmade food section
- Local farmers market branding
- Artisan bread company websites
- Organic food store designs

---

## ✅ Design Checklist

- [x] Warm earth-tone color palette
- [x] Elegant serif typography for headings
- [x] Clean sans-serif for body text
- [x] Pill-shaped buttons with hover effects
- [x] Soft rounded corners on cards
- [x] Generous white space
- [x] Subtle brown-toned shadows
- [x] Smooth transitions and animations
- [x] Consistent spacing system
- [x] Professional yet approachable feel

---

**Status**: ✅ Design System Implemented
**Last Updated**: February 7, 2026
**Designer**: AI-Assisted Design for SheBalance
