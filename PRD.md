# Planning Guide

The Sovereign Ecosystem is a dual-interface luxury real estate platform that unifies compliance intelligence for agents with a zero-UI, gesture-driven experience for high-net-worth clients.

**Experience Qualities**:
1. **Exclusivity** - The interface should feel like accessing a private vault, with invite-only access and biometric-simulated authentication that reinforces the premium positioning.
2. **Intelligence** - Proactive compliance monitoring and AI-driven recommendations should operate seamlessly in the background, surfacing insights at precisely the right moment.
3. **Sensory Richness** - Every interaction should provide multi-sensory feedback through sound effects, smooth animations, and tactile-feeling gestures that create a memorable, luxurious experience.

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This platform requires dual user flows (agent/client), sophisticated compliance logic modules, gesture recognition, real-time calculations, document management, and coordinate state management across local and cloud layers.

## Essential Features

**Live Market Data Feeds**
- Functionality: Real-time price tracking with simulated market movements, trend indicators, sparkline charts, and market index tickers showing property values updating every 3 seconds
- Purpose: Provides agents and clients with dynamic market intelligence to make informed investment decisions and track portfolio performance
- Trigger: Automatically initializes when properties load, runs continuously in background
- Progression: Properties load → Market data service initializes → Price updates begin streaming → Live price displays animate changes → Sparkline charts update → Market tickers scroll across dashboard → Trend indicators show up/down/stable movements
- Success criteria: Prices update smoothly without jank, animations feel premium and intentional, trend indicators accurately reflect price movements, market sentiment calculations are correct, no performance degradation with multiple properties

**Agent Dashboard (Portfolio Shield)**
- Functionality: Blind database architecture that separates client PII (local) from asset data (cloud) with automated compliance checking
- Purpose: Enables agents to monitor portfolio risk and regulatory compliance without exposing sensitive client information
- Trigger: Agent selects "Agent View" from role selector
- Progression: Dashboard loads → Watchlist displays properties with lease expiration within 90 days → Agent clicks property → Compliance modules (Good Cause NY, Lead Watchdog NJ) display calculated thresholds and flags → Risk map visualizes flagged properties
- Success criteria: Compliance calculations are accurate, flags appear for properties meeting threshold criteria, watchlist updates in real-time

**Client Feed (Zero-UI Experience)**
- Functionality: Full-screen vertical scroll feed with gesture-based interactions for property exploration
- Purpose: Provides an immersive, luxury browsing experience that feels intuitive and exclusive
- Trigger: Client authenticates via invite code and biometric simulation
- Progression: Vault unlocking animation → Feed loads with full-screen property cards → Swipe to navigate → Pinch card to reveal financial summary overlay → Pull down from top to access search filters
- Success criteria: Gestures feel natural and responsive, animations are smooth, financial data overlays correctly

**Financial Intelligence Tools**
- Functionality: Interactive circular yield slider that calculates projected returns in real-time
- Purpose: Empowers clients to model different rental scenarios and understand investment potential
- Trigger: Client taps "Calculate Returns" on property card
- Progression: Circular ring appears → Client drags handle around ring to adjust projected rent → Net yield percentage updates in center → Ring fills with champagne gradient proportional to yield
- Success criteria: Calculations are accurate, slider responds smoothly to drag, visual feedback is immediate

**AI Concierge**
- Functionality: Intelligent recommendation engine with floating chat interface that provides real-time, personalized property suggestions based on user preferences, portfolio analysis, and market conditions
- Purpose: Delivers proactive insights including property matches, lease expiration alerts, refinancing opportunities, and portfolio diversification advice
- Trigger: Floating action button in bottom right (shows notification badge when new insights available)
- Progression: Client taps button → Concierge panel slides up → Displays categorized insights (recommendations, alerts, opportunities, advice) sorted by urgency → Each insight shows property details, match score, reasons, and action buttons → Client can customize preferences via settings icon → Insights refresh in real-time as properties and preferences change
- Success criteria: Recommendations are contextually relevant with high match scores (80+), urgency levels are accurate, preference customization affects future recommendations, interface feels conversational and helpful

**Private Vault (Document Management)**
- Functionality: Secure document storage with time-limited sharing and privacy controls
- Purpose: Allows clients to store and share sensitive property documents securely
- Trigger: Client navigates to "Vault" section
- Progression: Masonry grid of blurred thumbnails loads → Client taps "Authenticate" → Biometric sim runs → Documents unblur → Client selects document → Generates time-bomb link with 24-hour expiration
- Success criteria: Authentication flow feels secure, link generation provides clear expiration notice, thumbnails blur/unblur smoothly

**Curated Badge System**
- Functionality: Animated wax seal badge that stamps onto verified properties
- Purpose: Provides visual trust signal for platform-verified listings
- Trigger: Verified property loads in feed
- Progression: Property card appears → Badge descends with stamping animation → Sound effect plays → Badge settles with slight bounce
- Success criteria: Animation feels weighty and premium, timing synchronized with sound

## Edge Case Handling

- **Missing Compliance Data**: Display "Data Incomplete" badge instead of calculations, prompt agent to update property records
- **Expired Invite Codes**: Show elegant error message directing user to contact their agent for new code
- **Gesture Conflicts**: Disable native browser gestures (pinch-zoom) within feed area, provide alternative zoom controls in property detail view
- **Sound Preferences**: Persist sound on/off toggle in settings, default to on for new users
- **Offline State**: Cache last viewed properties, display "Limited Connectivity" banner, queue actions for sync when reconnected
- **No Properties in Watchlist**: Show empty state with illustration and call-to-action to add properties
- **Document Upload Failures**: Retry automatically with exponential backoff, show progress indicator, allow manual retry
- **No Matching Recommendations**: Display empty state in AI Concierge suggesting preference adjustments, show general market insights
- **Stale Preferences**: Prompt user to review preferences after 30 days or when match scores consistently low
- **Multiple High-Priority Insights**: Prioritize by urgency (high > medium > low), then by insight type (alerts > opportunities > recommendations > advice)

## Design Direction

The design should evoke the feeling of accessing a private Swiss vault combined with the fluidity of luxury fashion e-commerce. Every interaction should feel weighty and intentional, with rich tactile feedback that makes digital interactions feel physical. The aesthetic balances brutalist minimalism (dark surfaces, generous whitespace) with opulent accents (champagne gold, serif typography, wax seal imagery). Motion should be purposeful and physics-based, never arbitrary or purely decorative.

## Color Selection

The palette creates dramatic contrast between deep onyx surfaces and champagne gold accents, establishing a sophisticated nocturnal luxury aesthetic.

- **Primary Color**: Champagne Gold `oklch(0.93 0.05 85)` - Communicates wealth, exclusivity, and premium positioning; used sparingly for CTAs, active states, and success indicators
- **Secondary Colors**: 
  - Onyx Deep `oklch(0.15 0 0)` - Primary background establishing dark, intimate atmosphere
  - Onyx Surface `oklch(0.20 0 0)` - Elevated surfaces for cards and panels
  - Slate Grey `oklch(0.55 0.01 240)` - Secondary text and dividers
- **Accent Color**: Champagne Gold `oklch(0.93 0.05 85)` - Used for interactive elements, progress indicators, and the circular yield slider fill
- **Foreground/Background Pairings**: 
  - Onyx Deep (#0F0F0F / oklch(0.15 0 0)): Champagne Gold text (oklch(0.93 0.05 85)) - Ratio 7.2:1 ✓
  - Onyx Surface (#1C1C1E / oklch(0.20 0 0)): White text (oklch(0.99 0 0)) - Ratio 14.8:1 ✓
  - Champagne Gold (oklch(0.93 0.05 85)): Onyx Deep text (oklch(0.15 0 0)) - Ratio 7.2:1 ✓

## Font Selection

Typography should establish clear hierarchy between elegant editorial headers and clean, highly readable body text, balancing timeless sophistication with modern clarity.

- **Typographic Hierarchy**: 
  - H1 (Section Titles): Playfair Display Bold / 48px / tracking-tight / leading-none
  - H2 (Property Titles): Playfair Display SemiBold / 32px / tracking-tight / leading-tight
  - H3 (Subsections): Playfair Display Medium / 24px / tracking-normal / leading-snug
  - Body Large (Property Descriptions): Inter Regular / 18px / tracking-normal / leading-relaxed
  - Body (UI Text): Inter Regular / 16px / tracking-normal / leading-normal
  - Small (Labels/Captions): Inter Medium / 14px / tracking-wide / uppercase / leading-tight
  - Numbers (Financial Data): Inter SemiBold / Tabular / varies by context

## Animations

Animations should feel physics-based and luxurious, with easing curves that mimic real-world materials - heavy metal vault doors, smooth silk fabrics, and weighted wax seals. Key moments include: the vault unlocking sequence (2s orchestrated animation with sound), the wax seal stamp (0.8s with bounce), pinch-to-summarize (0.3s spring animation), pull-to-search (rubber band effect), and the circular yield slider (real-time with gradient fill). All transitions use custom cubic-bezier curves to avoid generic easing. Micro-interactions like button presses have 100ms feedback, while major state changes take 400-600ms to feel substantial.

## Component Selection

- **Components**: 
  - Card (property display, heavily customized with full-bleed images)
  - Dialog (authentication modals, AI concierge chat)
  - Slider (adapted into circular yield calculator)
  - Tabs (role switcher between Agent/Client views)
  - Badge (compliance flags, curated seal)
  - Avatar (AI concierge 3D representation)
  - Input (invite code entry, search filters)
  - Button (primary CTAs with sound feedback)
  - ScrollArea (feed container with gesture detection)
  - Popover (document sharing options)
  - Progress (vault unlocking, loading states)
- **Customizations**: 
  - Custom SVG circular slider component (no direct shadcn equivalent)
  - Gesture detection layer using Framer Motion's drag and pan recognizers
  - Wax seal badge as custom SVG with animation orchestration
  - Sound manager service for coordinating Howler.js effects
  - Masonry grid layout for vault documents
  - Custom map placeholder component for risk visualization
- **States**: 
  - Buttons: Default (subtle glow), Hover (champagne border), Active (scale down 0.95 + sound), Disabled (50% opacity)
  - Inputs: Default (slate border), Focus (champagne ring + glow), Error (red border + shake), Success (green checkmark)
  - Cards: Default (elevated shadow), Hover (lift + glow), Pinched (scale 0.7 + overlay), Active (selected border)
- **Icon Selection**: 
  - Shield (compliance protection)
  - AlertTriangle (risk flags)
  - Lock (vault security)
  - Eye/EyeOff (document privacy toggle)
  - Calendar (lease expiration)
  - TrendingUp (yield calculations)
  - MessageCircle (AI concierge)
  - Download (document actions)
  - Clock (time-bomb links)
  - Sparkles (curated badge accent)
- **Spacing**: 
  - Container padding: px-6 (mobile), px-12 (desktop)
  - Card gaps: gap-4 (tight grids), gap-8 (property cards)
  - Section spacing: mb-12 (between major sections)
  - Component internal: p-6 (cards), p-4 (buttons)
- **Mobile**: 
  - Agent dashboard becomes tabbed interface prioritizing watchlist first
  - Risk map collapses to list view with expand capability
  - Client feed remains full-screen swipeable cards (primary mobile experience)
  - Circular yield slider scales to fit screen, touch-optimized drag handle
  - AI concierge button moves to bottom center on mobile
  - Vault grid reduces to 2 columns on mobile
  - All gestures are touch-first, mouse interactions are adaptations
