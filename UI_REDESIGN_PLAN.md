# Library Reader App - UI Redesign Plan

## Design System Foundation (Already Established)
- **Colors**: Primary (blue), Secondary (purple), Success (green), Danger (red), Warning (amber), Muted (slate)
- **Gradients**: `brand-gradient` (primary→secondary), `brand-gradient-soft` (light variants)
- **Typography**: Inter font, `ink`/`ink-soft`/`ink-muted` text hierarchy
- **Spacing**: 4px base unit, consistent padding (16px screen edges)
- **Radius**: `rounded-xl` (cards), `rounded-2xl` (large), `rounded-full` (pills)
- **Shadows**: `shadow-soft`, `shadow-card`, `shadow-glow`
- **Components**: Screen, AppHeader, BottomTabBar, Card, StatCard, Chip, SectionTitle, Button (gradient variant), Input, Avatar, StatusBadge, EmptyState

---

## 1. Login Screen Redesign

### Current Issues
- Plain white background, no brand presence
- Generic "L" logo in blue box
- Card with basic shadow, no visual hierarchy
- Inputs use gray-50 background, not brand-aligned
- Forgot password link is small and disconnected
- Demo text is an afterthought

### Redesign Goals
- **Immersive brand experience** — gradient background with subtle pattern
- **Modern card** — elevated surface with soft shadow, rounded-3xl
- **Branded logo** — gradient icon with library symbol
- **Input fields** — surface background, primary focus ring, floating labels
- **Primary CTA** — gradient button, full width, prominent
- **Secondary actions** — ghost style, integrated into flow
- **Micro-interactions** — loading states, validation feedback

### Visual Spec
```
Background: brand-gradient (full screen)
  └─ Subtle geometric pattern overlay (opacity 5%)

Logo Area (centered, mt-16):
  └─ 64x64 rounded-2xl bg-white/10 backdrop-blur
     └─ BookOpen icon, 32px, white

Card (mx-6, mt-8, rounded-3xl, bg-surface, shadow-card):
  Padding: 24px
  
  Title: "Welcome Back" (text-2xl, font-bold, text-ink)
  Subtitle: "Sign in to access your library" (text-sm, text-ink-muted)
  
  Email Field:
    Label: "Email" (text-sm, font-medium, text-ink)
    Input: h-12, rounded-xl, bg-surface, border-border
           focus: border-primary-500, ring-2 ring-primary-500/20
    Icon: Mail, 20px, text-ink-muted (focus: text-primary-500)
    Error: text-xs, text-danger, mt-1
  
  Password Field: (same pattern)
    Toggle visibility button (Eye/EyeOff icon)
  
  Forgot Password: 
    Right-aligned, text-sm, text-primary-600, font-medium
    mt-2, mb-6
  
  Sign In Button:
    variant="gradient", size="lg", full width
    h-12, rounded-xl, font-semibold
    Loading: white spinner
  
  Divider: "or continue with" (text-xs, text-ink-muted, my-6)
  
  Social Buttons (future):
    Google / Apple - ghost variant, icon + text
  
  Demo Hint (bottom):
    text-xs, text-ink-muted, centered
```

### Component Updates Needed
- `Input` — add `focusRing` support, `rightIcon` for password toggle
- `Button` — ensure gradient variant works on all platforms
- New: `AuthBackground` component for gradient + pattern

---

## 2. Home/Dashboard Screen Redesign

### Current Issues
- Stats cards are functional but lack visual polish
- Overdue banner uses hardcoded red background
- Streak card is basic, no celebration feel
- Loan cards have plain gray placeholder covers
- Section title is plain text
- No empty state illustration for "no loans"

### Redesign Goals
- **Hero greeting** — personalized, time-aware, with subtle animation
- **Stat cards** — elevated, with icon chips, trend indicators
- **Smart alerts** — overdue/due-soon as dismissible banners with actions
- **Streak celebration** — animated flame, progress ring, milestone badges
- **Loan cards** — beautiful cover art placeholders, progress rings, due-date chips
- **Empty state** — delightful illustration, clear CTA to browse library

### Visual Spec

#### Greeting Hero (replaces AppHeader on home only)
```
Gradient card (brand-gradient, rounded-3xl, p-6, shadow-glow)
  Row 1: "Good morning, Faizan!" (text-xl, font-bold, text-white)
  Row 2: "You have 3 books due this week" (text-sm, text-white/80)
  Row 3: Quick actions row (3 chips):
    • "Browse Library" → navigate to library
    • "Scan Book" → navigate to scan
    • "Reading Goal" → future feature
```

#### Stat Grid (2×2, gap-3)
Each StatCard:
```
bg-surface, rounded-2xl, p-4, shadow-soft, border border-border/60
  Icon chip: w-10 h-10 rounded-xl, tinted bg (primary-50/danger-50/etc)
             Icon 20px, tinted stroke
  Value: text-2xl font-extrabold text-ink
  Label: text-xs font-medium text-ink-muted
  Trend (optional): text-xs font-medium text-success/danger + arrow icon
```

#### Smart Alerts (dismissible, slide-in animation)
```
Overdue: bg-danger-50, border-l-4 border-danger, rounded-r-xl, p-4
  Row: AlertCircle (danger) + text
  Action: "Return Now" ghost button → navigate to loan

Due Soon: bg-warning-50, border-l-4 border-warning, rounded-r-xl, p-4
  Row: Clock (warning) + text
  Action: "View Details" ghost button
```

#### Streak Celebration Card
```
bg-brand-gradient-soft, rounded-2xl, p-5, relative
  Top-right: Flame icon (primary) + "3 day streak!" badge
  Center: Large progress ring (70% complete) with "3/7" inside
  Bottom: "Read 20 min today to keep streak" (text-sm, text-ink-soft)
  CTA: "Open Book" gradient button (sm)
```

#### Currently Borrowed Section
```
SectionTitle: "Currently Borrowed" + "View All" (if >3)

Loan Card (horizontal, rounded-2xl, bg-surface, shadow-soft):
  Cover: w-20 h-28 rounded-xl, bg-brand-gradient-soft
         Book initial large (text-4xl, font-extrabold, text-primary-600)
         Overlay: "Free" / "Members" chip (top-right)
  Content:
    Title: text-base font-semibold text-ink (2 lines)
    Author: text-sm text-ink-muted (1 line)
    Meta row: Due date chip + StatusBadge + Progress ring (if reading)
    Progress: thin ring around cover showing reading progress
```

#### Empty State (no loans)
```
Centered, py-16:
  Illustration: Open book with sparkles (custom SVG or emoji large)
  Title: "No books borrowed yet" (text-lg, font-semibold, text-ink)
  Subtitle: "Discover your next read in the library" (text-sm, text-ink-muted)
  CTA: "Browse Library" gradient button → navigate to library
```

---

## 3. Library Screen Redesign (Planned)

### Key Changes
- Search bar: floating label, clear button, recent searches dropdown
- Category chips: gradient active state, smoother animation
- Book grid: 2-col, beautiful cover placeholders, hover/tap scale
- Filter/sort: bottom sheet with chips
- Infinite scroll with skeleton loaders

---

## 4. Donate Screen Redesign (Planned)

### Key Changes
- Hero: gradient card with impact stats animation
- Amount selector: pill buttons with haptic feedback
- Custom amount: inline expand, live total
- Payment methods: card/wallet with icons, selected state
- Receipt: beautiful success animation, shareable

---

## 5. Profile Screen Redesign (Planned)

### Key Changes
- Header: gradient avatar area, name, member since badge
- Sections: cards with icon leading, chevron trailing
- Borrowing history: timeline design, expandable
- Settings: grouped, toggle switches for notifications
- Logout: destructive button at bottom

---

## 6. Scan Screen Redesign (Planned)

### Key Changes
- Full-screen camera view with overlay
- Animated scan line
- Torch/flash toggle
- Gallery import option
- Result bottom sheet with book details

---

## 7. Ebook Reader Redesign (Planned)

### Key Changes
- Immersive reading: hide bars on tap
- Top bar: title, bookmark, TOC, settings
- Bottom bar: progress slider, page nav, zoom, theme
- Themes: light/sepia/dark, font size, line height
- Reading progress: cloud sync indicator

---

## 8. Auth Screens (Forgot/Reset Password)

### Key Changes
- Consistent with login: gradient bg, branded card
- Step indicator for multi-step flows
- Success state: checkmark animation, auto-redirect

---

## Implementation Order

| Phase | Screens | Est. Effort |
|-------|---------|-------------|
| 1 | Login, Home | 2-3 days |
| 2 | Library, Donate | 2 days |
| 3 | Profile, Scan | 1-2 days |
| 4 | Ebook Reader, Auth | 2 days |
| 5 | Polish, animations, testing | 1-2 days |

---

## Technical Notes

### New Components to Create
1. `AuthBackground` — gradient + pattern for auth screens
2. `GreetingHero` — home-specific header replacement
3. `SmartAlert` — dismissible banner with action
4. `StreakCard` — animated progress ring
5. `LoanCard` — horizontal book card with progress
6. `EmptyStateIllustration` — delightful empty states
7. `ProgressRing` — reusable SVG/canvas ring
8. `BookCover` — placeholder with initial + gradient

### Existing Components to Enhance
- `Input` — focus ring, right icon, floating label
- `Button` — gradient variant, loading spinner color
- `Card` — variant="elevated" with shadow-card
- `StatCard` — trend indicator prop
- `Screen` — optional hero slot

### Animation Library
- Use `react-native-reanimated` (already installed)
- Shared element transitions for navigation
- Layout animations for list changes
- Spring-based micro-interactions

### Accessibility
- All interactive elements: `accessibilityRole`, `accessibilityLabel`
- Color contrast: WCAG AA minimum
- Dynamic type support (respect system font scale)
- Screen reader tested

---

## Success Metrics
- [ ] TypeScript clean (`npx tsc --noEmit`)
- [ ] All tests pass (`npm test`)
- [ ] Web bundle succeeds (`npx expo export --platform web`)
- [ ] Android/iOS build succeeds
- [ ] Visual regression: screenshots match design
- [ ] Performance: 60fps scrolling, <100ms interactions