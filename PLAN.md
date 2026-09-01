# 📚 LibraryOS Reader — Expo React Native App

## TL;DR

Build a cross-platform (iOS, Android, Web) React Native app using Expo for the reader module of LibraryOS. **Phase 1-9 use mock data** for fast UI/UX iteration. API integration happens in Phase 10+.

---

## 🚀 Approach: Mock-First, API-Later

1. **Phases 1-4**: Scaffolding, infrastructure, auth mock, tab nav
2. **Phases 5-9**: All screens with **hardcoded mock data** (no API calls)
3. **Phase 10**: Replace mock data with real API integration
4. **Phase 11+**: Polish, scanner, builds

This lets us iterate on UI/UX quickly without backend dependencies.

---

## 2. Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Expo SDK 52+** | Universal builds (iOS, Android, Web), OTA updates via EAS |
| Navigation | **Expo Router v4** | File-based routing, shared layouts, deep linking for free |
| Styling | **NativeWind v4** (Tailwind for RN) | Matches the existing web UI's Tailwind-based design tokens |
| State | **Zustand** + **TanStack Query** | Zustand for auth/ui state; TanStack Query for server cache (same as web) |
| Forms | **React Hook Form** + **Zod** | Same validation schemas as the web app |
| PDF | **react-native-pdf** / **expo-web-browser** | Native PDF rendering; web falls back to in-browser viewer |
| Storage | **expo-secure-store** | Tokens in secure storage; reading progress in AsyncStorage |
| HTTP | **Axios** (same instance config as web) | Reuse `frontend/lib/api.ts` logic with platform-aware base URL |
| Icons | **@expo/vector-icons** (or `lucide-react-native`) | Matches the lucide icons used in the web UI |
| Animations | **React Native Reanimated 3** | Smooth transitions, gestures, micro-interactions |

---

## 3. Project Structure

```
library-reader/
├── app/                        # Expo Router file-based routes
│   ├── _layout.tsx             # Root layout (providers, splash)
│   ├── (auth)/                 # Auth group — no tab bar
│   │   ├── _layout.tsx         # Stack navigator for auth
│   │   ├── login.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   ├── (tabs)/                 # Main app — bottom tab bar
│   │   ├── _layout.tsx         # Tab navigator
│   │   ├── index.tsx           # Dashboard (home tab)
│   │   ├── library.tsx         # E-Library browse
│   │   ├── scan.tsx            # QR/Barcode scanner (book check-in)
│   │   ├── donate.tsx          # Donations
│   │   └── profile.tsx         # Profile & settings
│   ├── ebook/
│   │   └── [id].tsx            # E-Book reader/viewer
│   └── +not-found.tsx          # 404
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── ForgotPasswordForm.tsx
│   ├── dashboard/
│   │   ├── GreetingHeader.tsx
│   │   ├── LoanStatsGrid.tsx
│   │   ├── ActiveLoanCard.tsx
│   │   ├── OverdueBanner.tsx
│   │   └── ReadingStreak.tsx
│   ├── library/
│   │   ├── BookGrid.tsx
│   │   ├── BookListItem.tsx
│   │   ├── EbookCard.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── SearchBar.tsx
│   ├── ebook/
│   │   ├── PdfViewer.tsx
│   │   ├── EBookInfo.tsx
│   │   └── PageControls.tsx
│   ├── donate/
│   │   ├── AmountSelector.tsx
│   │   ├── ImpactCards.tsx
│   │   └── DonationReceipt.tsx
│   ├── profile/
│   │   ├── ProfileHeader.tsx
│   │   ├── BorrowingHistory.tsx
│   │   └── SettingsList.tsx
│   ├── shared/
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── PageHeader.tsx
│   │   ├── StatusBadge.tsx
│   │   └── ThemedText.tsx
│   └── ui/                     # Reusable primitives
│       ├── index.ts
│       └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useEBooks.ts
│   ├── useLending.ts
│   ├── useColorScheme.ts
│   └── useReadingProgress.ts
├── lib/
│   ├── api.ts                  # Axios instance + API functions
│   ├── auth.ts                 # Token management (secure-store)
│   ├── constants.ts            # Colors, spacing, config
│   ├── utils.ts                # Shared utilities
│   └── theme.ts                # NativeWind / Tailwind theme
├── store/
│   └── authStore.ts            # Zustand auth state
├── types/
│   ├── reader.ts               # Can share or mirror libraryos types
│   ├── book.ts
│   └── api.ts
├── assets/
│   ├── fonts/
│   ├── images/
│   └── icon.png
├── tailwind.config.js          # NativeWind config
├── app.json                    # Expo config
├── eas.json                    # EAS Build config
├── tsconfig.json
└── package.json
```

---

## 4. Screen-by-Screen Design

### 4.1 Auth Screens (`(auth)/`)

#### `login.tsx` — Login
- **Layout**: Centered card on a subtle gradient background
- **Elements**:
  - Library logo / app icon at top
  - Email field (with ` keyboardType="email-address"`)
  - Password field (with show/hide toggle)
  - "Sign In" primary button (full-width, rounded)
  - "Forgot Password?" text link below
- **Behavior**: Validates with Zod → calls `POST /api/auth/login` → stores tokens in SecureStore → navigates to `(tabs)`
- **Keyboard handling**: `KeyboardAvoidingView` + `ScrollView`

#### `forgot-password.tsx`
- Email input → "Send Reset Link" button → success toast

#### `reset-password.tsx`
- New password + confirm fields → "Reset Password" button → redirect to login

---

### 4.2 Main Tab Screens (`(tabs)/`)

#### `_layout.tsx` — Tab Navigator
- **Bottom tabs** with 5 items:
  1. 🏠 Home (dashboard) — `BookOpenIcon`
  2. 📚 Library (e-library) — `LibraryIcon`
  3. 📷 Scan — `ScanIcon` (center, elevated/floating)
  4. ❤️ Donate — `HeartIcon`
  5. 👤 Profile — `UserIcon`
- **Style**: Rounded tab bar, frosted glass effect on iOS, accent color for active tab
- **Floating scan button**: Slightly raised with a circular background for the barcode scanner

#### `index.tsx` — Reader Dashboard (Home)
- **Top**: Greeting header with user's first name + current time-of-day ("Good evening, Faizan!")
- **Stats row** (horizontal scroll on mobile, grid on tablet):
  - Active Loans count (with book icon, accent bg)
  - Overdue count (red if > 0)
  - Due Soon count (amber)
  - Max Allowed (muted)
- **Overdue banner**: If any overdue loans exist, show a prominent warning card with count and CTA
- **Reading streak**: Flame emoji + streak count (gamification)
- **Active Loans section**: Horizontal scroll of `ActiveLoanCard` components
  - Each card: book cover thumbnail, title, author, due date, days remaining
  - Tap → book detail or lending detail
- **Empty state**: If no active loans, show illustration + "Visit the library to borrow a book!"

#### `library.tsx` — E-Library
- **Top**: Search bar with magnifying glass icon
- **Filters**: Horizontal scrollable category chips (Fiction, Science, History, etc.)
- **Grid**: 2-column book grid (responsive to screen width)
  - Each `EbookCard`: cover image, title, author, category badge
  - "Members Only" badge if `accessType === "members-only"`
  - Tap → ebook detail
- **Pull-to-refresh**: Standard `RefreshControl`
- **Pagination**: Infinite scroll with `onEndReached`

#### `scan.tsx` — Book Scanner
- **Camera view** with barcode overlay frame
- Uses `expo-camera` with barcode scanning
- On scan: look up book by barcode via `GET /api/library/books?barcode=...`
- Show scanned book info in a bottom sheet: title, author, availability
- Quick actions: "View in Library" or "Add to Wishlist" (future)

#### `donate.tsx` — Donate
- **Impact header**: "Support Your Library" with heart illustration
- **Impact cards** (3 cards): New Books, Community Access, Infrastructure — same as web
- **Amount selector**: Preset amounts (₹100, ₹250, ₹500, ₹1000) + custom input
- **Payment method**: Card or e-Wallet toggle
- **Donate button**: Large CTA → processing animation → success receipt with confetti
- **Receipt**: Transaction ID, amount, date, "Thank you!" message + share button

#### `profile.tsx` — Profile & Settings
- **Avatar + name + reader ID** at top
- **Sections**:
  1. **Borrowing History** — Table/list of past loans with status badges (tap to expand)
  2. **My Details** — Name, email, phone, address (read-only with edit link)
  3. **Change Password** — Current + new password form
  4. **KYC Status** — Verification badge (Verified ✅ / Pending ⏳)
  5. **Reader Card** — View/download digital library card with QR code
  6. **App Settings** — Theme toggle (light/dark), Language (EN/UR)
  7. **About** — App version, terms, privacy policy
  8. **Logout** — Red text button at bottom

---

### 4.3 Detail Screens

#### `ebook/[id].tsx` — E-Book Reader
- **Top bar**: Back button, book title (truncated), bookmark icon
- **PDF Viewer**: 
  - Native: `react-native-pdf` for iOS/Android
  - Web: embedded iframe or `expo-web-browser`
- **Bottom controls** (floating, auto-hide):
  - Page number: current / total
  - Page slider
  - Zoom in/out buttons
- **Reading progress**: Saved to backend via `PATCH /api/library/lending/:id/progress` (or localStorage fallback)
- **Info header** (collapsible): Book title, author, description, cover

---

## 5. UI/UX Design Principles

### 5.1 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#2563EB` (Blue 600) | CTAs, active tabs, links |
| Accent | `#F0F7FF` (Blue 50) | Card backgrounds, stats |
| Danger | `#EF4444` (Red 500) | Overdue, errors |
| Warning | `#F59E0B` (Amber 500) | Due soon |
| Success | `#10B981` (Green 500) | Active status, verified |
| Muted | `#6B7280` (Gray 500) | Secondary text |
| Background | `#F9FAFB` (Gray 50) | Screen bg (light mode) |
| Card | `#FFFFFF` | Card surfaces |
| Border | `#E5E7EB` (Gray 200) | Dividers, card borders |

**Dark mode**: Inverted values with `DarkTheme` support via NativeWind.

### 5.2 Typography

- **Headings**: 700 weight, `font-display` equivalent (SF Pro Display on iOS, Roboto on Android)
- **Body**: 400 weight, 16px base
- **Caption**: 400 weight, 12px
- **Scale**: Using a modular scale (1.25 ratio)

### 5.3 Spacing & Layout

- **Base unit**: 4px
- **Screen padding**: 16px (mobile), 24px (tablet/web)
- **Card border radius**: 16px (rounded-2xl)
- **Button border radius**: 12px (rounded-xl)
- **Max content width**: 768px (centered on larger screens)

### 5.4 Cross-Platform Adaptations

| Platform | Adaptation |
|----------|-----------|
| **iOS** | SF Symbols, haptic feedback on actions, pull-to-refresh with large title |
| **Android** | Material ripple effects, system back gesture support |
| **Web** | Responsive layout (max-width container), hover states, cursor changes, keyboard shortcuts |

### 5.5 Interaction Patterns

- **Pull-to-refresh** on all list screens
- **Skeleton loaders** while data loads (matching content shape)
- **Toast notifications** for success/error (bottom sheet style)
- **Bottom sheets** for quick actions and filters (using `@gorhom/bottom-sheet`)
- **Swipe actions** on list items (swipe left to return book)
- **Haptic feedback** on button presses (light impact)
- **Smooth transitions**: Shared element transitions for book covers (tap card → detail)

### 5.6 Accessibility

- All interactive elements have `accessibilityLabel` and `accessibilityRole`
- Color contrast ratio ≥ 4.5:1 for text
- Minimum touch target: 44×44pt
- Support for Dynamic Type (iOS) / font scaling (Android)
- Screen reader announcements for status changes

---

## 6. Authentication Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  App Launch  │────▶│  SecureStore  │────▶│  Has Token? │
└─────────────┘     │  Check Token  │     └──────┬──────┘
                    └──────────────┘            │
                                          ┌─────┴─────┐
                                          │           │
                                         Yes          No
                                          │           │
                                    ┌─────▼─────┐ ┌──▼────────┐
                                    │  Refresh   │ │   Login   │
                                    │  Token     │ │   Screen  │
                                    └─────┬─────┘ └───────────┘
                                          │
                                    ┌─────▼─────┐
                                    │   (tabs)  │
                                    │   Home    │
                                    └───────────┘
```

- Tokens stored in `expo-secure-store` (encrypted on device)
- Auto-refresh on 401 using Axios interceptor
- `authStore` (Zustand) holds user object + auth state
- On logout: clear SecureStore + reset Zustand → navigate to `(auth)/login`

---

## 7. Backend API Reuse

The Expo app calls the **same backend** (`/api/*`) already serving the Next.js frontend. Key API mappings:

| Screen | API Endpoint | Method |
|--------|-------------|--------|
| Login | `/api/auth/login` | POST |
| Refresh | `/api/auth/refresh` | POST |
| Profile / Me | `/api/auth/me` | GET |
| Dashboard stats | Reader lending data | GET |
| Active loans | `/api/library/lending?readerId=X` | GET |
| E-Library browse | `/api/library/ebooks?status=published` | GET |
| E-Book detail | `/api/library/ebooks/:id` | GET |
| Donations | *(future endpoint or in-app)* | POST |
| Reader history | `/api/library/lending?readerId=X` | GET |

**CORS**: Add the Expo web origin to the backend's CORS whitelist (`env.frontendAppUrl` or a new `env.readerAppUrl`).

---

## 8. Phases

### Phase 1: Project Scaffolding & Configuration
**Goal**: Initialize Expo project, install all dependencies, configure tooling.
1. Create Expo project in `library-reader/` with `npx create-expo-app@latest`
2. Install core dependencies:
   - `expo-router` (file-based routing)
   - `nativewind` + `tailwindcss` (styling)
   - `zustand` (state management)
   - `@tanstack/react-query` (server state — will use with mock data initially)
   - `react-hook-form` + `zod` (forms + validation)
   - `expo-secure-store` (token storage)
   - `@gorhom/bottom-sheet` (bottom sheets)
   - `react-native-reanimated` (animations)
   - `lucide-react-native` (icons)
3. Configure NativeWind (tailwind.config.js, babel.config.js)
4. Set up Expo Router in `app.json` (scheme for deep linking)
5. Configure `tsconfig.json` with path aliases (`@/` → `./`)
6. Add `reader:dev`, `reader:web` scripts to root `package.json`
**Verification**: `npx expo start` runs without errors

### Phase 2: Core Infrastructure
**Goal**: Theme system, shared UI components, mock data helpers.
1. Create `lib/theme.ts` (colors, typography, spacing constants matching web)
2. Create shared UI components (`Button`, `Card`, `Badge`, `Input`, `Avatar`, `EmptyState`, `PageHeader`, `StatusBadge`, etc.)
3. Create `lib/mockData.ts` (mock user, loans, ebooks, donation, history)
4. Create `lib/utils.ts` (formatDate, calculateDaysOverdue, etc.)
**Verification**: Import components in a test screen, verify styling renders correctly

### Phase 3: Auth Flow (Mock)
**Goal**: Login screens with mock authentication (no real API).
1. Create `lib/auth.ts` (SecureStore helpers: getToken, setToken, clearTokens)
2. Create `store/authStore.ts` (Zustand: user, login mock, logout, isAuthenticated)
3. Build `(auth)/_layout.tsx` (stack navigator)
4. Build `login.tsx` screen
5. Build `forgot-password.tsx` screen
6. Build `reset-password.tsx` screen
7. Implement token persistence and auto-login
**Verification**: Login with any email/password works, tokens persist, auto-login on restart

### Phase 4: Tab Navigation & Layout
**Goal**: Bottom tab bar with 5 tabs, responsive layout.
1. Build `(tabs)/_layout.tsx` (tab navigator with 5 tabs)
2. Create placeholder screens for each tab (Dashboard, Library, Scan, Donate, Profile)
3. Build floating scan button
4. Create responsive layout (mobile: tabs, tablet: sidebar)
**Verification**: Tab navigation works, scan button is visually distinct

### Phase 5: Dashboard Screen (Mock Data)
**Goal**: Reader dashboard with stats, active loans, alerts — all mock.
1. Build `index.tsx` — Dashboard page with pull-to-refresh
2. Create `components/dashboard/GreetingHeader.tsx`
3. Create `components/dashboard/LoanStatsGrid.tsx`
4. Create `components/dashboard/OverdueBanner.tsx`
5. Create `components/dashboard/ReadingStreak.tsx`
6. Create `components/dashboard/ActiveLoanCard.tsx`
7. Create `hooks/useLending.ts` (returns mock loans)
**Verification**: Dashboard renders with mock data, all components display correctly

### Phase 6: E-Library Screen (Mock Data)
**Goal**: Browse and search ebooks with filters — all mock.
1. Build `library.tsx` — E-Library page
2. Create `components/library/SearchBar.tsx`
3. Create `components/library/CategoryFilter.tsx`
4. Create `components/library/EbookCard.tsx`
5. Create `hooks/useEBooks.ts` (returns filtered mock ebooks)
**Verification**: Ebook list renders, search/filter works client-side

### Phase 7: E-Book Reader Screen (Mock Data)
**Goal**: PDF viewer with page controls — mock PDF.
1. Build `ebook/[id].tsx` — E-Book reader page
2. Create `components/ebook/PdfViewer.tsx` (mock placeholder)
3. Create `components/ebook/PageControls.tsx`
4. Create `hooks/useReadingProgress.ts` (AsyncStorage)
**Verification**: Mock PDF viewer opens, page navigation works, progress saves locally

### Phase 8: Donate Screen (Mock Data)
**Goal**: Donation flow with amount selection and receipt — all mock.
1. Build `donate.tsx` — Donate page
2. Create `components/donate/AmountSelector.tsx`
3. Create `components/donate/PaymentForm.tsx`
4. Create `components/donate/DonationReceipt.tsx`
**Verification**: Donation flow completes with mock receipt

### Phase 9: Profile Screen (Mock Data)
**Goal**: User profile, borrowing history, settings — all mock.
1. Build `profile.tsx` — Profile page
2. Create `components/profile/ProfileHeader.tsx`
3. Create `components/profile/BorrowingHistory.tsx`
4. Create `components/profile/SettingsList.tsx`
**Verification**: Profile loads with mock data, history displays, settings toggle works

### Phase 10: API Integration
**Goal**: Replace all mock data with real backend API calls.
1. Create `lib/api.ts` (Axios instance with interceptors)
2. Update hooks to use real API
3. Update auth store for real API
**Verification**: All screens show real data from backend

### Phase 11: Polish & Cross-Platform
**Goal**: Dark mode, haptics, skeletons, error states, accessibility.
1. Add dark mode support (NativeWind dark: classes)
2. Add haptic feedback on interactions
3. Add skeleton loaders for all data-fetching screens
4. Add pull-to-refresh on list screens
5. Add error states and empty states with illustrations
6. Accessibility improvements

### Phase 12: Barcode Scanner (Bonus)
**Goal**: QR/barcode scanner for book lookup.
1. Build `scan.tsx` — Scanner page with expo-camera
2. Implement barcode scanning and book lookup

### Phase 13: EAS Build & Deployment
**Goal**: Configure builds for iOS, Android, and Web.
1. Configure `eas.json` with build profiles
2. Add app icon and splash screen with library branding
3. Build and test on all platforms

---

## 9. EAS Build Configuration

```json
// eas.json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {
      "ios": { "appleId": "..." },
      "android": { "serviceAccountKeyPath": "..." }
    }
  }
}
```

---

## 10. Future Enhancements (Post-MVP)

| Feature | Priority | Notes |
|---------|----------|-------|
| Push notifications | High | Overdue reminders, due-soon alerts |
| Barcode scanner | Medium | Quick book lookup at library |
| Reading streaks/gamification | Medium | Motivate consistent reading |
| Bookmarks & highlights | Low | In-PDF annotations |
| Offline reading | Low | Download ebooks for offline access |
| Wishlist | Low | Save books for later |
| Reader chat support | Low | In-app help or chatbot |
| Multi-language (EN/UR) | Medium | i18n from web app |
| Widget (iOS/Android) | Low | Current loan summary widget |

---

## 11. Monorepo Integration

The `library-reader` folder lives alongside `libraryos/` in the workspace. Add scripts to the root `package.json`:

```json
{
  "scripts": {
    "reader:dev": "cd library-reader && npx expo start",
    "reader:web": "cd library-reader && npx expo start --web",
    "reader:build": "cd library-reader && eas build"
  }
}
```

**Shared types**: Consider extracting common types to a shared package (`libraryos/shared/types/`) or simply mirror the relevant types in `library-reader/types/` with a comment referencing the source.

---

## ✅ Verification Checklist

### Mock Phases (1-9)
- [ ] Phase 1: `npx expo start` runs without errors
- [ ] Phase 2: Components render correctly, mock data defined
- [ ] Phase 3: Mock login/logout flow works, tokens persist
- [ ] Phase 4: Tab navigation works with all 5 tabs
- [ ] Phase 5: Dashboard renders with mock data
- [ ] Phase 6: Ebook list renders with mock data, search/filter works
- [ ] Phase 7: Mock PDF viewer opens, page navigation works
- [ ] Phase 8: Donation flow completes with mock receipt
- [ ] Phase 9: Profile loads with mock data

### API Integration (Phase 10)
- [ ] Phase 10: All screens show real data from backend

### Polish & Build (Phases 11-13)
- [ ] Phase 11: Dark mode toggles, skeletons show
- [ ] Phase 12: Barcode scanner reads codes
- [ ] Phase 13: Builds for iOS, Android, Web

---

*Plan created: 2026-07-14*
*Updated: 2026-07-14 — Mock-first approach*
*Status: Ready for implementation*
