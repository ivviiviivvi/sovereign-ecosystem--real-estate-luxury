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
- Functionality: Real-time price tracking with simulated market movements, trend indicators, sparkline charts, and market index tickers showing property values updating dynamically with adjustable volatility and update frequency controls. **Historical Market Replay** allows recording and playback of past market activity with interactive timeline visualization, multiple time ranges (1min-1hour), playback speed controls (0.5x-5x), and pattern detection to identify surge, crash, oscillation, steady, and recovery patterns with confidence scores. **Pattern-Based Alerts** trigger notifications when specific volatility patterns are detected with configurable confidence thresholds, priority levels, and cooldown periods. **Multi-Channel Delivery** enables critical market alerts to be delivered via email, SMS, WhatsApp, or Telegram with configurable priority filtering and **multi-language support for WhatsApp and Telegram messages** (English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Arabic, Russian), ensuring users never miss important market events even when not actively monitoring the platform. **Automated Language Detection** intelligently detects the user's preferred language from browser settings, system timezone, or optionally geolocation, and automatically configures notification language preferences with a non-intrusive banner prompting users to confirm or change the detected language.
- Purpose: Provides agents and clients with dynamic market intelligence to make informed investment decisions and track portfolio performance, with ability to control simulation parameters for testing and demonstration. Historical replay enables analysis of past volatility patterns to understand market behavior, test strategies against historical data, and identify recurring market patterns for predictive insights. Pattern alerts ensure immediate awareness of critical market conditions. **External delivery channels with multi-language support ensure critical alerts reach international users in their preferred language**, enabling rapid response to time-sensitive market conditions regardless of location or language preference. **Automated language detection eliminates manual language configuration, providing a seamless onboarding experience for international users by automatically setting appropriate notification languages based on user context.**
- Trigger: Automatically initializes when properties load, runs continuously in background. Historical replay accessed via floating History button (bottom-left) which records snapshots automatically. Pattern alerts trigger when detected patterns meet confidence and priority thresholds. **Multi-channel delivery configured via Alert Settings panel**, accessible from the bell icon notification center. **Language detection runs automatically on first app load, displays confirmation banner for non-English detected languages with 70%+ confidence.**
- Progression: Properties load → Market data service initializes → Price updates begin streaming → Snapshots recorded automatically → Live price displays animate changes → Sparkline charts update → Market tickers scroll across dashboard → Trend indicators show up/down/stable movements → Users can access floating control panel to adjust volatility (0.1%-10%), update speed (0.3s-30s), and pause/resume market simulation → Users open Historical Replay panel → D3.js chart displays all market tickers over time as color-coded lines → Click any point on timeline to jump to that moment → Use playback controls (play/pause/skip) to replay historical data → Adjust playback speed → Select different time ranges to analyze → Pattern Analyzer identifies volatility patterns in real-time with confidence scores and descriptions → Pattern history shows all detected patterns with timestamps → Pattern alerts appear in notification center with unread badge → **Users click bell icon → Open Alert Settings → Configure Multi-Channel Delivery → Enter contact details (email, phone for SMS/WhatsApp, Telegram username) → Select language for WhatsApp/Telegram messages from dropdown (10 languages available, with auto-detected language shown as suggestion) → Select which priority levels to deliver externally (critical, high, medium, low) → Save and enable delivery channels → When critical patterns detected, alerts sent via configured channels in selected language → Delivery logs track sent/failed notifications → Users receive formatted emails with full alert details and metrics → Users receive concise SMS messages → Users receive WhatsApp messages with rich formatting and emojis in selected language → Users receive Telegram messages with HTML formatting in selected language → Language detection banner appears on first load for non-English users → User clicks "Yes, use [Language]" to accept or "Keep English" to dismiss → Selection persists via localStorage → Detected language shown in notification settings with detection source (Browser Settings/System Timezone/Location)**
- Success criteria: Prices update smoothly without jank, animations feel premium and intentional, trend indicators accurately reflect price movements, market sentiment calculations are correct, no performance degradation with multiple properties, volatility controls respond instantly, update frequency changes apply without interruption. Historical replay: Chart renders smoothly with up to 1000+ data points, playback controls respond instantly, timeline scrubbing is smooth, snapshots are retained for selected time range, pattern detection identifies changes within 5-10 seconds with >70% confidence, pattern history updates in real-time without duplicates. **Multi-channel delivery: All contact fields validate correctly before enabling, notifications send within 2-3 seconds of alert trigger, delivery logs accurately track status, email formatting includes all alert details, SMS messages stay under 160 characters, WhatsApp/Telegram messages display correctly translated text in selected language, timestamps use locale-appropriate formatting, contact information persists securely, delivery status indicators show active channels and languages in notification center. Language detection: Detects language accurately from browser settings (95% confidence), timezone (70% confidence), or geolocation (80% confidence), banner appears only for non-English detections with 70%+ confidence, user choice persists across sessions, detection source displayed in notification settings, no performance impact from detection API calls, graceful fallback to English if detection fails.**

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
- Functionality: Intelligent recommendation engine with floating chat interface that provides real-time, personalized property suggestions based on user preferences, portfolio analysis, and market conditions. **Side-by-side property comparison** allows selecting up to 4 properties to compare across all key metrics (price, cap rate, ROI, size, amenities) with AI-generated insights highlighting the best values, important considerations, potential risks, and strategic recommendations.
- Purpose: Delivers proactive insights including property matches, lease expiration alerts, refinancing opportunities, and portfolio diversification advice. **Property comparison provides comprehensive side-by-side analysis with intelligent recommendations to help users make data-driven investment decisions.**
- Trigger: Floating action button in bottom right (shows notification badge when new insights available). **Property selection checkboxes appear on property cards in agent dashboard** - click to select up to 4 properties, then click "Compare" in the floating comparison panel.
- Progression: Client taps button → Concierge panel slides up → Displays categorized insights (recommendations, alerts, opportunities, advice) sorted by urgency → Each insight shows property details, match score, reasons, and action buttons → Client can customize preferences via settings icon → Insights refresh in real-time as properties and preferences change. **For comparison: Select properties via checkboxes → Selection counter appears in floating panel (bottom-right) → Click "Compare" button → Full-screen comparison modal opens → AI generates insights automatically → View grid comparison (all metrics side-by-side) or detailed view (full property cards with all data) → Toggle between views → Best values highlighted with champagne gold rings → AI insights categorized by type (winner, consideration, warning, recommendation) → Click regenerate to get fresh AI analysis → Remove properties from comparison or close modal to return**
- Success criteria: Recommendations are contextually relevant with high match scores (80+), urgency levels are accurate, preference customization affects future recommendations, interface feels conversational and helpful. **Comparison: Up to 4 properties can be selected simultaneously, selection state persists while browsing, best values accurately identified per metric, AI insights are relevant and actionable (4-6 insights covering all categories), grid/detailed views render correctly, modal is responsive and performs smoothly, removing properties updates comparison in real-time**

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
- **Property Comparison Empty State**: Show instructional message when fewer than 2 properties selected, prevent opening comparison modal
- **Property Comparison Selection Limit**: Disable selection UI when 4 properties already selected, show tooltip explaining maximum
- **Property Comparison AI Failure**: Show error toast if AI insights fail to generate, allow manual retry, comparison metrics still functional
- **Property Comparison with Missing Data**: Display "N/A" for missing metrics, exclude from "best value" highlighting, AI insights acknowledge data gaps
- **Market Simulation Extreme Values**: Constrain volatility slider to prevent unrealistic market swings, cap update frequency to prevent performance issues, persist control settings between sessions
- **Historical Replay Empty State**: Show "Waiting for market data..." message when no snapshots recorded yet, begin recording automatically
- **Historical Replay Memory Management**: Automatically prune snapshots older than selected time range to prevent memory issues, limit to 1000 snapshots maximum
- **Pattern Detection Insufficient Data**: Wait for at least 10 data points before attempting pattern detection, show "Collecting data..." message
- **Replay at End of Timeline**: Automatically stop playback when reaching last snapshot, reset button returns to live mode
- **Pattern Alert Spam**: 30-second cooldown per pattern type prevents duplicate notifications, confidence thresholds filter out low-quality patterns
- **Email/SMS Delivery Failures**: Retry logic with exponential backoff, delivery logs track failed attempts with error messages, users can review delivery history
- **Invalid Contact Information**: Validate email addresses and phone numbers before enabling delivery, show inline errors for invalid formats, prevent enabling with invalid data
- **Email/SMS Not Configured**: In-app notifications continue to work normally, delivery logs remain empty, settings panel prompts users to configure channels
- **Multiple Delivery Channels Active**: Alerts sent to all enabled channels simultaneously, each tracked independently in delivery logs
- **High-Frequency Alerts**: Pattern cooldowns prevent overwhelming users, priority filtering lets users receive only critical/high alerts externally
- **Language Detection Failures**: Gracefully falls back to English if browser settings unavailable or detection API fails, no error shown to user
- **Already Dismissed Language Banner**: User preference stored in localStorage, banner never reappears even after clearing app state
- **Language Detection for English Users**: Banner never appears for users with English browser settings, auto-detection is silent
- **Changing Language After Detection**: Users can manually change language in notification settings at any time, detection info shown as reference only
- **Geolocation Permission Denied**: Detection falls back to browser/timezone methods, no permission prompt shown by default (opt-in only)

## Design Direction

The design should evoke the feeling of accessing a private, luxurious sanctuary with a sophisticated feminine aesthetic. Every interaction should feel refined and elegant, with soft tactile feedback that makes digital interactions feel gentle yet intentional. The aesthetic balances modern minimalism (soft surfaces, generous whitespace, flowing curves) with luxurious accents (rose gold, gradient overlays, subtle animations). Motion should be purposeful and graceful, never harsh or mechanical - like silk fabric flowing or rose petals falling.

## Color Selection

The palette creates a soft, ethereal luxury aesthetic with rose-tinted warmth and pearl-like luminosity, establishing a sophisticated feminine nocturnal/daytime hybrid mood.

- **Primary Color**: Rose Blush `oklch(0.65 0.15 340)` - Communicates elegance, sophistication, and feminine luxury; used for CTAs, active states, and key interactive elements
- **Secondary Colors**: 
  - Pearl White `oklch(0.97 0.01 320)` - Primary background establishing soft, luminous atmosphere
  - Champagne Soft `oklch(0.90 0.08 70)` - Warm accent for highlights and secondary surfaces
  - Lavender Mist `oklch(0.85 0.10 300)` - Ethereal accent for gradients and overlays
  - Mauve Deep `oklch(0.50 0.08 320)` - Text and subtle contrast elements
- **Accent Color**: Rose Gold `oklch(0.75 0.12 50)` - Used for gradient blends, progress indicators, and premium feature highlights
- **Foreground/Background Pairings**: 
  - Pearl White (oklch(0.97 0.01 320)): Mauve Deep text (oklch(0.50 0.08 320)) - Ratio 6.5:1 ✓
  - Card Background (oklch(0.99 0.005 320)): Foreground text (oklch(0.25 0.02 320)) - Ratio 12.1:1 ✓
  - Rose Blush (oklch(0.65 0.15 340)): White text (oklch(0.99 0 0)) - Ratio 5.2:1 ✓

## Font Selection

Typography should establish a refined, editorial elegance with flowing serifs for headers and clean, lightweight sans-serif for body text, creating a sophisticated luxury magazine aesthetic.

- **Typographic Hierarchy**: 
  - H1 (Section Titles): Cormorant Light / 60px / tracking-wide / leading-tight / font-weight: 300
  - H2 (Property Titles): Cormorant Regular / 40px / tracking-wide / leading-tight / font-weight: 400
  - H3 (Subsections): Cormorant Medium / 28px / tracking-normal / leading-snug / font-weight: 500
  - Body Large (Property Descriptions): Outfit Light / 18px / tracking-normal / leading-relaxed / font-weight: 300
  - Body (UI Text): Outfit Light / 16px / tracking-wide / leading-normal / font-weight: 300
  - Small (Labels/Captions): Outfit Light / 13px / tracking-widest / uppercase / leading-tight / font-weight: 300
  - Numbers (Financial Data): Outfit Regular / Tabular / varies by context / font-weight: 400

## Animations

Animations should feel graceful and fluid, with easing curves that mimic flowing fabrics, floating petals, and gentle breezes. Key moments include: the vault unlocking sequence (2s orchestrated animation with sound), the wax seal stamp (0.8s with gentle settle), pinch-to-summarize (0.3s spring animation), pull-to-search (silk ribbon effect), and the circular yield slider (real-time with gradient shimmer). All transitions use elegant cubic-bezier curves (e.g., [0.16, 1, 0.3, 1]) to create smooth, organic motion. Micro-interactions like button presses have 100ms feedback with subtle scale transforms, while major state changes take 400-600ms with graceful fade and slide combinations. Hover states include gentle lifts and soft glow effects.

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
  - Buttons: Default (soft glow), Hover (rose blush border + lift), Active (scale down 0.98 + sound), Disabled (50% opacity)
  - Inputs: Default (soft border), Focus (rose blush ring + glow), Error (red border + gentle shake), Success (green checkmark)
  - Cards: Default (elevated shadow), Hover (soft lift + glow), Pinched (scale 0.7 + overlay), Active (selected gradient border)
- **Icon Selection**: 
  - Shield (compliance protection) - strokeWidth: 1.5
  - AlertTriangle (risk flags) - strokeWidth: 1.5
  - Lock (vault security) - strokeWidth: 1.5
  - Eye/EyeOff (document privacy toggle) - strokeWidth: 1.5
  - Calendar (lease expiration) - strokeWidth: 1.5
  - TrendingUp (yield calculations) - strokeWidth: 1.5
  - MessageCircle (AI concierge) - strokeWidth: 1.5
  - Download (document actions) - strokeWidth: 1.5
  - Clock (time-bomb links) - strokeWidth: 1.5
  - Sparkles (curated badge accent) - strokeWidth: 1.5
  - Settings (market controls) - strokeWidth: 1.5
  - Zap (volatility indicator) - strokeWidth: 1.5
  - Activity (market activity) - strokeWidth: 1.5
  - Play/Pause (market simulation control) - strokeWidth: 1.5
  - History (historical replay access) - strokeWidth: 1.5
  - SkipBack/SkipForward (replay navigation) - strokeWidth: 1.5
  - RotateCcw (reset to live mode) - strokeWidth: 1.5
  - Calendar (time range selection) - strokeWidth: 1.5
  - AlertCircle (pattern analysis) - strokeWidth: 1.5
  - Mail (email notifications) - strokeWidth: 1.5
  - MessageSquare (SMS notifications) - strokeWidth: 1.5
  - Send (delivery settings) - strokeWidth: 1.5
  - CheckCircle/XCircle/Clock (delivery status indicators) - strokeWidth: 1.5
  - GitCompare (property comparison) - strokeWidth: 1.5
  - Check (selection confirmation) - strokeWidth: 1.5
  - Award (best value indicator) - strokeWidth: 1.5
  - Lightbulb (considerations) - strokeWidth: 1.5
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
