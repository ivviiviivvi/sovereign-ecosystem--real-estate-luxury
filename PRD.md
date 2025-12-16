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

**Dark Mode with Moonlit Theme**
- Functionality: Persistent theme toggle allowing users to switch between light mode (rose-tinted, pearl luminosity) and dark mode (deep indigo, moonlit lavender accents) with smooth 700ms color transitions across all UI elements. Toggle button in top-left with animated sun/moon icon rotation. Theme preference persists using KV storage. All components support both themes with appropriate color adaptations including cards, buttons, text, borders, shadows, and gradients.
- Purpose: Provides viewing comfort in different lighting conditions while maintaining the luxurious aesthetic. Dark mode creates an intimate, nocturnal atmosphere perfect for evening portfolio reviews, while light mode offers clarity for daytime analysis.
- Trigger: Theme toggle button (top-left corner) with sun/moon icon. Defaults to light mode on first visit, then remembers user preference.
- Progression: User clicks theme toggle → Icon rotates 360° → Background colors transition over 700ms → All UI elements smoothly fade to new palette → Particle effects adapt hue and blend mode → Cards update with new backgrounds/borders → Text colors adjust for optimal contrast → Theme preference saved to KV storage → On reload, theme applies immediately without flash
- Success criteria: Toggle responds instantly with smooth animation, all colors transition without jarring flashes, particle effects adapt appropriately, no performance degradation during transition, theme preference persists across sessions, WCAG AA contrast ratios maintained in both modes, dark mode feels cohesive and luxurious (not just inverted colors), sound effect plays on toggle

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
- Functionality: Intelligent recommendation engine with floating chat interface that provides real-time, personalized property suggestions based on user preferences, portfolio analysis, and market conditions. **Side-by-side property comparison** allows selecting up to 4 properties to compare across all key metrics (price, cap rate, ROI, size, amenities) with AI-generated insights highlighting the best values, important considerations, potential risks, and strategic recommendations. **AR Property Visualization** enables viewing property overlays through device camera with interactive controls for scale, rotation, and positioning, allowing users to visualize properties in real-world spaces with detailed property information displayed on the overlay.
- Purpose: Delivers proactive insights including property matches, lease expiration alerts, refinancing opportunities, and portfolio diversification advice. **Property comparison provides comprehensive side-by-side analysis with intelligent recommendations to help users make data-driven investment decisions. AR visualization offers immersive property previews that help users understand scale, proportions, and spatial relationships in real-world contexts.**
- Trigger: Floating action button in bottom right (shows notification badge when new insights available). **Property selection checkboxes appear on property cards in agent dashboard** - click to select up to 4 properties, then click "Compare" in the floating comparison panel. **AR view accessible via "AR View" button on property cards or floating button in client feed.**
- Progression: Client taps button → Concierge panel slides up → Displays categorized insights (recommendations, alerts, opportunities, advice) sorted by urgency → Each insight shows property details, match score, reasons, and action buttons → Client can customize preferences via settings icon → Insights refresh in real-time as properties and preferences change. **For comparison: Select properties via checkboxes → Selection counter appears in floating panel (bottom-right) → Click "Compare" button → Full-screen comparison modal opens → AI generates insights automatically → View grid comparison (all metrics side-by-side) or detailed view (full property cards with all data) → Toggle between views → Best values highlighted with champagne gold rings → AI insights categorized by type (winner, consideration, warning, recommendation) → Click regenerate to get fresh AI analysis → Remove properties from comparison or close modal to return. For AR: Click "AR View" button → Camera permission prompt → Camera feed appears with property overlay → Drag overlay to reposition → Use sliders to adjust scale (0.5x-3x) and rotation (0°-360°) → Toggle overlay visibility → View property details on overlay card → Toggle fullscreen mode → Reset view returns to default positioning → Close returns to dashboard.**
- Success criteria: Recommendations are contextually relevant with high match scores (80+), urgency levels are accurate, preference customization affects future recommendations, interface feels conversational and helpful. **Comparison: Up to 4 properties can be selected simultaneously, selection state persists while browsing, best values accurately identified per metric, AI insights are relevant and actionable (4-6 insights covering all categories), grid/detailed views render correctly, modal is responsive and performs smoothly, removing properties updates comparison in real-time. AR: Camera access granted successfully, overlay renders smoothly at 60fps, scale and rotation controls respond instantly, drag repositioning feels natural and responsive, property details are clearly visible on overlay, fullscreen toggle works without interrupting camera feed, reset button returns to centered default view, all UI controls remain accessible and responsive.**

**AR Property Visualization with Device Camera**
- Functionality: Augmented reality property preview using device camera feed with interactive property card overlay and **advanced gesture controls**. Renders live camera feed to canvas with property image and details overlaid in glassmorphic card with AR targeting corners. Users can **drag with one finger to reposition**, **pinch with two fingers to zoom in/out (0.5x-3x range)**, and **rotate with two fingers** (0-360°) for intuitive multi-touch control. Users can also use sliders for precise adjustments. Toggle overlay visibility, fullscreen mode, and info panel independently. **Capture and save AR snapshots directly to Private Vault** with timestamp and property details, or download snapshots directly to device. **Property selection interface** allows choosing any property from portfolio for AR viewing when accessed from main menu (vs auto-selecting when accessed from property card).
- Purpose: Allows users to visualize properties in real-world spaces through their device camera with intuitive gesture controls, helping understand scale, proportions, and how the property might fit in different contexts. Creates an immersive, modern property exploration experience. **Gesture controls make AR interaction feel natural and intuitive like manipulating a physical object. Snapshot capability preserves AR configurations for later review or sharing.**
- Trigger: "AR View" button on property cards in agent dashboard and client feed (auto-selects that property), or AR View button in floating toolbar (opens property selector modal). Requires device camera access permission.
- Progression: Click "AR View" button → **If multiple properties available and no specific property selected, Property Selector modal opens → Grid of all properties with search/filter → Select one property → Click "Open AR View"** → Permission prompt for camera access → Camera feed initializes and displays → Property overlay appears centered with targeting corners → Info panel explains controls (including gesture support) → **Pinch with two fingers to zoom in/out (gesture overrides scale slider)** → **Rotate with two fingers to change angle (gesture overrides rotation slider)** → **Drag with one finger to reposition** → Or use sliders for precise scale (0.5x-3x) and rotation (0-360°) adjustments → Toggle overlay visibility on/off → Toggle fullscreen for immersive view → **Click Save icon to capture AR snapshot and save to Private Vault** → **Click Download icon to save snapshot to device** → Reset button returns to default centered position → Close button stops camera and returns to previous view
- Success criteria: Camera access granted successfully, live feed renders at 60fps to canvas without lag, overlay renders with proper glassmorphic styling and shadows, **property selector shows all properties in searchable grid, selection highlights property with visual feedback, single property auto-selects when accessed from property card, pinch gesture accurately scales overlay (0.5-3x range) with smooth interpolation, two-finger rotation provides smooth 360° rotation without jank, gestures work simultaneously (can pinch and rotate at same time), gesture values sync with sliders in real-time**, drag repositioning feels natural with no delay, scale/rotation sliders provide precise manual control, overlay visibility toggle maintains camera feed, fullscreen toggle works without interrupting camera, **snapshot capture saves high-quality PNG to Private Vault with correct metadata (property ID, title, timestamp), download saves snapshot to device with descriptive filename, save button shows loading state during capture**, reset button returns to exact center position with scale=1 and rotation=0, all controls remain accessible in all modes, camera stops completely when closing AR view, works on both mobile and desktop with appropriate touch/mouse optimizations

**Property Comparison Slider with Synchronized Flip Animations**
- Functionality: Interactive side-by-side property comparison with draggable slider divider and synchronized card flip animations revealing detailed metrics. Users drag the vertical slider to reveal more of one property or the other, with smooth clip-path transitions. Clicking either property card flips it to reveal detailed comparison metrics on the back, with option to synchronize flips across both cards simultaneously for parallel exploration. **Property selection interface** allows choosing any 2 properties from portfolio for comparison when accessed from main menu (vs auto-selecting adjacent properties when accessed from property card). **Capture and save comparison snapshots directly to Private Vault** with both property details and slider position, or download snapshots directly to device.
- Purpose: Provides an engaging, visual way to compare two properties directly, with the ability to see how they differ at a glance through the slider interaction and access detailed metrics through card flips without losing context. **Property selector ensures users can compare any two properties, not just adjacent ones. Snapshot capability preserves comparison configurations for later review or sharing.**
- Trigger: "Compare" button on property cards when viewing property details (auto-selects that property plus one other), or from client feed/dashboard comparison interface (opens property selector modal). Requires selecting exactly 2 properties for slider mode (vs 2-4 for grid comparison).
- Progression: Click "Compare" on property card → **If multiple properties available, Property Selector modal opens → Grid of all properties with search/filter → Select 2 properties (counter shows "1 of 2", "2 of 2") → Click "Compare Properties"** → Comparison slider modal opens → Full-screen split view with draggable slider in center → Drag slider left/right to reveal more of Property A or B → Slider shows real-time percentage split → Click either card to flip and reveal detailed metrics → Back of card shows all comparison data with indicators (better/worse/neutral) for each metric → Click "Sync Flip" button to flip both cards simultaneously → Both cards animate in sequence → **Click "Save to Vault" to capture comparison snapshot and save to Private Vault** → **Click "Download" to save snapshot to device** → Close modal returns to previous view
- Success criteria: **Property selector shows all properties in searchable grid, selection counter accurately shows "X of 2", can toggle selection on/off, cannot select more than 2 properties, selection highlights with visual feedback**, slider drag is smooth and responsive with no jank, clip-path transitions feel natural, percentage indicator updates in real-time, card flips complete in 600ms with proper 3D perspective, synchronized flip maintains proper timing (300ms stagger between cards), all metrics display correctly with accurate comparison indicators, **snapshot capture renders both properties accurately with slider position preserved, saved snapshot shows in Private Vault with both property titles, download saves snapshot with descriptive filename including both property names, save/download buttons show loading states**, mobile touch drag works equivalently to desktop mouse drag, comparison state persists during flip animations


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
- **Theme Toggle During Animations**: Theme change interrupts and completes current animations gracefully, no animation conflicts
- **Theme Preference on First Load**: Applies saved theme immediately on mount, no flash of wrong theme during hydration
- **Dark Mode Particle Rendering**: Particles adapt color hue and blend mode appropriately, maintain performance in both themes
- **Tab Switching During Theme Change**: Theme transition continues smoothly even when switching tabs, completes when tab regains focus
- **AR Camera Access Denied**: Show clear error message with retry option and close button, explain camera requirement for AR feature
- **AR Camera Not Available**: Detect if device has no camera and disable/hide AR buttons, show tooltip explaining requirement
- **AR Performance Issues**: Monitor frame rate and automatically reduce overlay complexity if dropping below 30fps
- **AR During Device Rotation**: Handle orientation change gracefully, maintain overlay position relative to viewport center
- **AR Overlay Out of Bounds**: Constrain drag area to keep overlay within visible canvas bounds, prevent losing overlay off-screen
- **Comparison Slider with One Property**: Disable "Compare" button when only one property exists, show tooltip explaining need for 2+ properties
- **Comparison Slider Drag Performance**: Optimize clip-path updates to maintain 60fps during slider drag on low-end devices
- **Comparison Slider Card Flip During Drag**: Prevent flip interaction while slider is being dragged to avoid conflicting gestures
- **Comparison Slider Missing Data**: Handle properties with incomplete data gracefully, show "N/A" for missing metrics, don't break comparison
- **Synchronized Flip Already Flipped**: If one or both cards already flipped, sync flip reverses appropriately or flips to opposite side intelligently

## Design Direction

The design should evoke the feeling of accessing a private, luxurious sanctuary with a sophisticated feminine aesthetic that transforms seamlessly between day and night modes. Every interaction should feel refined and elegant, with soft tactile feedback that makes digital interactions feel gentle yet intentional. The aesthetic balances modern minimalism (soft surfaces, generous whitespace, flowing curves) with luxurious accents (rose gold/moonlit silver, gradient overlays, subtle animations, floating particles). Motion should be purposeful and graceful, never harsh or mechanical - like silk fabric flowing or rose petals falling. The dark mode embraces a moonlit elegance with deep indigo backgrounds, soft lavender accents, and shimmering particle effects that create an ethereal, nocturnal luxury experience.

## Color Selection

The palette creates a soft, ethereal luxury aesthetic with rose-tinted warmth and pearl-like luminosity for light mode, transitioning to a deep moonlit elegance in dark mode with indigo depths and lavender shimmer.

**Light Mode:**
- **Primary Color**: Rose Blush `oklch(0.65 0.15 340)` - Communicates elegance, sophistication, and feminine luxury; used for CTAs, active states, and key interactive elements
- **Secondary Colors**: 
  - Pearl White `oklch(0.97 0.01 320)` - Primary background establishing soft, luminous atmosphere
  - Champagne Soft `oklch(0.90 0.08 70)` - Warm accent for highlights and secondary surfaces
  - Lavender Mist `oklch(0.85 0.10 300)` - Ethereal accent for gradients and overlays
  - Mauve Deep `oklch(0.50 0.08 320)` - Text and subtle contrast elements
- **Accent Color**: Rose Gold `oklch(0.75 0.12 50)` - Used for gradient blends, progress indicators, and premium feature highlights

**Dark Mode (Moonlit Palette):**
- **Primary Color**: Moonlit Lavender `oklch(0.70 0.15 285)` - Soft, glowing lavender that feels luxurious and nocturnal
- **Secondary Colors**:
  - Midnight Blue `oklch(0.15 0.03 270)` - Deep background creating intimate nighttime atmosphere
  - Moonlit Indigo `oklch(0.35 0.12 280)` - Rich mid-tone for elevated surfaces
  - Moonlit Violet `oklch(0.55 0.18 290)` - Vibrant accent for interactive elements
  - Moonlit Silver `oklch(0.80 0.05 280)` - Shimmering text and icon color
- **Accent Color**: Moonlit Mist `oklch(0.45 0.08 275)` - Subtle atmospheric accent for depth

- **Foreground/Background Pairings**: 
  - Light: Pearl White (oklch(0.97 0.01 320)): Mauve Deep text (oklch(0.50 0.08 320)) - Ratio 6.5:1 ✓
  - Light: Card Background (oklch(0.99 0.005 320)): Foreground text (oklch(0.25 0.02 320)) - Ratio 12.1:1 ✓
  - Light: Rose Blush (oklch(0.65 0.15 340)): White text (oklch(0.99 0 0)) - Ratio 5.2:1 ✓
  - Dark: Midnight Blue (oklch(0.15 0.03 270)): Moonlit Silver text (oklch(0.80 0.05 280)) - Ratio 8.1:1 ✓
  - Dark: Moonlit Indigo (oklch(0.35 0.12 280)): Moonlit Silver text (oklch(0.80 0.05 280)) - Ratio 4.7:1 ✓

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

Animations should feel graceful and fluid, with easing curves that mimic flowing fabrics, floating petals, and gentle breezes. **Atmospheric particle effects** float across backgrounds in both light and dark modes, creating depth and luxury through connected particle networks with subtle glow effects. **Property cards** feature staggered entrance animations (0.5s delay per card, scale from 0.95), smooth hover lifts (-8px translate with 1.02 scale), and exit animations for seamless transitions. **Theme transitions** between light and dark modes are smooth 700ms color transitions with rotating icon animations. Key moments include: the vault unlocking sequence (2s orchestrated animation with sound), the wax seal stamp (0.8s with gentle settle), pinch-to-summarize (0.3s spring animation), pull-to-search (silk ribbon effect), and the circular yield slider (real-time with gradient shimmer). All transitions use elegant cubic-bezier curves (e.g., [0.16, 1, 0.3, 1]) to create smooth, organic motion. Micro-interactions like button presses have 100ms feedback with subtle scale transforms, while major state changes take 400-600ms with graceful fade and slide combinations. Hover states include gentle lifts and soft glow effects. **Floating background elements** use independent animation loops (15-25s duration) with vertical float, horizontal drift, and opacity pulsing to create a living, breathing atmosphere.

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
  - **Canvas-based particle background with connected network effects**
  - **Framer Motion floating elements with independent animation loops**
  - **Animated property card wrapper with staggered entrance/exit**
  - **Theme toggle with rotating icon animations**
  - **AR camera overlay with Canvas 2D rendering for live video feed compositing**
  - **Property comparison slider with Framer Motion drag and clip-path masking**
  - **Synchronized 3D card flip animations using CSS transforms and perspective**
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
  - Camera (AR view) - strokeWidth: 1.5
  - ArrowLeftRight (comparison slider) - strokeWidth: 1.5
  - RefreshCw (synchronized flip) - strokeWidth: 1.5
  - ZoomIn/ZoomOut (AR scale controls) - strokeWidth: 1.5
  - Eye/EyeOff (AR overlay toggle) - strokeWidth: 1.5
  - Maximize2/Minimize2 (fullscreen toggle) - strokeWidth: 1.5
  - RotateCcw (AR reset view) - strokeWidth: 1.5
  - ChevronLeft/ChevronRight (slider direction indicators) - strokeWidth: 1.5
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
