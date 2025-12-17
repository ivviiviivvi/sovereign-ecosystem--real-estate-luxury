# Testing Guide: Live Collaboration, Offline Sync & AR Room Templates

This guide provides comprehensive instructions for testing the newly integrated features: **Live Collaboration**, **Offline Sync**, and **AR Room Templates with Spatial Recognition**.

---

## 🎯 Feature Overview

### 1. Live Collaboration for Contractor Collections
- Real-time viewing and commenting on measurements
- Multiple contractors can join simultaneously  
- Live cursor tracking showing where each contractor is looking
- Comment threads on individual measurements
- Instant notifications when contractors join/leave

### 2. Offline Mode with Auto-Sync
- Measurements saved locally when offline
- Automatic sync when connection restored
- Visual indicator showing sync status
- Failed sync retry mechanism
- Complete measurement data preservation

### 3. AR Room Templates with Spatial Recognition
- Auto-detects room type based on dimensions
- 8 predefined room templates (Kitchen, Bedroom, Bathroom, Living Room, etc.)
- Smart measurement presets for each room type
- Confidence scoring for room detection
- Template-specific measurement suggestions

---

## 🧪 Test Scenarios

### Test 1: Live Collaboration in Contractor Workspace

#### Prerequisites
- At least one property with AR measurements saved
- Access to the Contractor Workspace

#### Steps

1. **Create a Measurement Collection**
   ```
   1. Open the app and navigate to Agent Dashboard
   2. Click "Contractor Workspace" button
   3. Switch to "Collections" tab
   4. Click "New Collection"
   5. Enter:
      - Collection Name: "Kitchen Renovation Project"
      - Description: "Main floor kitchen measurements"
      - Tags: "kitchen, plumbing, electrical"
   6. Select at least 3 measurements
   7. Click "Create Collection"
   ```
   ✅ **Expected**: Collection created successfully with toast notification

2. **Invite Contractors**
   ```
   1. Switch to "Contractors" tab
   2. Click "Invite Contractor"
   3. Fill in contractor details:
      - Name: "John Smith"
      - Email: "john@contractor.com"
      - Company: "ABC Construction"
      - Access Level: "View & Comment"
   4. Click "Invite Contractor"
   ```
   ✅ **Expected**: Contractor added and invite link copied to clipboard

3. **Share Collection with Contractors**
   ```
   1. Return to "Collections" tab
   2. Click "Share" button on your collection
   3. Select the contractor(s) to share with
   4. Click "Share Collection"
   ```
   ✅ **Expected**: 
   - "Collection shared" toast notification
   - "Live collaboration enabled" message
   - "Live Collaboration" button appears on the collection card

4. **Start Live Collaboration Session**
   ```
   1. Click the "Live Collaboration" button on the shared collection
   2. Observe the collaboration view opening
   ```
   ✅ **Expected**:
   - Dialog opens showing active contractors
   - Current user (You) appears in the active contractors list
   - Measurements list displays all collection measurements
   - Activity feed shows session events

5. **Test Real-Time Commenting**
   ```
   1. In the collaboration view, click on a measurement
   2. Type a comment in the input field
   3. Press Enter or click Send
   ```
   ✅ **Expected**:
   - Comment appears immediately in the thread
   - Comment shows your name and timestamp
   - Success toast notification
   - Sound effect plays

6. **Simulate Multiple Contractors** (Simulated for Testing)
   ```
   Note: The system simulates contractors joining/leaving for testing purposes
   1. Observe the "Active Contractors" section
   2. Watch for contractors with colored avatars
   3. Each contractor has a unique color identifier
   ```
   ✅ **Expected**:
   - Each contractor has a unique color
   - Online status indicator (green dot) visible
   - Access level badge displayed (if applicable)

---

### Test 2: Offline Mode with Auto-Sync

#### Prerequisites
- Device with ability to disable network connection
- AR Property Viewer access with camera permissions

#### Steps

1. **Create Measurements While Online**
   ```
   1. Open AR Property Viewer for any property
   2. Enable measurement mode (Ruler icon)
   3. Create 2-3 measurements
   4. Observe the sync indicator (bottom-right corner)
   ```
   ✅ **Expected**:
   - Sync indicator shows "Synced" with green checkmark
   - Measurements saved successfully

2. **Test Offline Detection**
   ```
   1. Disconnect from internet (turn off WiFi, enable airplane mode, or use DevTools)
   2. Observe the sync indicator change
   ```
   ✅ **Expected**:
   - Sync indicator changes to "Offline" with CloudOff icon
   - Red warning color displays
   - Toast notification: "You are offline"

3. **Create Measurements While Offline**
   ```
   1. With internet disabled, create 3-4 new measurements
   2. Add labels to measurements
   3. Click save/export measurements
   ```
   ✅ **Expected**:
   - Measurements save locally without errors
   - Toast shows: "X changes will sync when reconnected"
   - Sync indicator shows pending count (e.g., "4 pending")

4. **Test Auto-Sync on Reconnection**
   ```
   1. Reconnect to internet (enable WiFi, disable airplane mode)
   2. Wait 2-3 seconds
   3. Observe the sync indicator
   ```
   ✅ **Expected**:
   - Sync indicator shows "Syncing..." with spinning icon
   - After completion: "Synced" with green checkmark
   - Toast notification: "All changes synced"
   - Success sound effect plays

5. **Verify Sync Status Details**
   ```
   1. Click on the sync indicator (bottom-right)
   2. View the detailed sync status panel
   ```
   ✅ **Expected** Panel shows:
   - Connection status (Online/Offline)
   - Pending changes count: 0
   - Last sync time
   - "All changes synced successfully" message

6. **Test Failed Sync Retry**
   ```
   1. While offline, create measurements
   2. Reconnect but immediately disconnect again
   3. Reconnect and click "Retry Failed Syncs" if any failures show
   ```
   ✅ **Expected**:
   - Failed syncs count displays
   - Retry button available
   - Retrying re-attempts the sync
   - Success when connection stable

---

### Test 3: AR Room Templates with Spatial Recognition

#### Prerequisites
- AR Property Viewer access
- Camera permissions granted

#### Steps

1. **Access AR Room Templates**
   ```
   1. Open AR Property Viewer
   2. Look for the "Room Templates" button (sparkle icon) in top controls
   3. Click to open the templates dialog
   ```
   ✅ **Expected**:
   - Dialog opens showing "AR Room Templates"
   - 8 room types displayed (Kitchen, Bedroom, Bathroom, etc.)
   - Each room has an emoji icon and description

2. **Browse Room Templates**
   ```
   1. Scroll through the room types list
   2. Click on "Kitchen"
   3. Observe the measurements panel on the right
   ```
   ✅ **Expected**:
   - Kitchen template highlights with rose/lavender border
   - Right panel shows typical kitchen dimensions:
     * Width: 10 ft (typical)
     * Length: 12 ft (typical)  
     * Height: 9 ft (typical)
   - 5 kitchen-specific measurements display:
     * Kitchen Width
     * Kitchen Length
     * Counter Height
     * Island Width
     * Cabinet Depth

3. **Select and Use a Measurement Preset**
   ```
   1. With Kitchen selected, click on "Counter Height" preset
   2. Observe the AR view
   ```
   ✅ **Expected**:
   - Dialog closes automatically
   - AR view activates measurement mode
   - Toast: "Using Kitchen template - Measuring: Counter Height"
   - Template icon visible in measurement info
   - Default length suggestion applied (3 ft)

4. **Test Manual Spatial Recognition**
   ```
   1. Create 3 manual measurements to define a room:
      - Width measurement: ~12 feet
      - Length measurement: ~14 feet  
      - Height measurement: ~9 feet
   2. Return to Room Templates dialog
   3. Click "Analyze Space" button
   ```
   ✅ **Expected**:
   - Analysis runs immediately
   - Confidence card appears with gradient border
   - Shows detected room type (e.g., "Bedroom")
   - Displays confidence percentage (e.g., "87% Match")
   - Shows measured dimensions:
     * Width: 12.0 ft
     * Length: 14.0 ft
     * Area: 168 sq ft
     * Volume: 1,512 cu ft
   - Progress bar reflects confidence level
   - Color-coded: Green (>80%), Yellow (60-80%), Orange (<60%)

5. **Test Auto-Detection Confidence Levels**
   
   **High Confidence Test (Kitchen ~85-95%)**
   ```
   Measure: Width 10ft, Length 12ft, Height 9ft
   Expected: Detects "Kitchen" with high confidence
   ```
   
   **Medium Confidence Test (Bedroom ~70-80%)**
   ```
   Measure: Width 11ft, Length 13ft, Height 9ft  
   Expected: Detects room type with moderate confidence
   ```
   
   **Low Confidence Test (Ambiguous ~50-60%)**
   ```
   Measure: Width 8ft, Length 9ft, Height 9ft
   Expected: Best guess shown but with lower confidence
   ```

6. **Test Different Room Types**
   ```
   Test each room template:
   - Kitchen: 10x12x9 ft → Kitchen-specific presets
   - Bedroom: 12x14x9 ft → Bedroom presets (closet, window)
   - Bathroom: 7x9x9 ft → Bathroom presets (shower, vanity)
   - Living Room: 15x18x9 ft → Living room presets (TV wall)
   - Dining Room: 12x14x9 ft → Dining presets (table space)
   - Home Office: 10x12x9 ft → Office presets (desk wall)
   - Hallway: 4x10x9 ft → Hallway presets (door spacing)
   - Walk-in Closet: 6x8x9 ft → Closet presets (rod length)
   ```
   ✅ **Expected** For each:
   - Correct room type selected
   - Appropriate measurement presets shown
   - Typical dimensions match expectations
   - Relevant icons and descriptions display

7. **Test Template-Specific Features**
   ```
   1. Select "Bathroom" template
   2. Note the spatial features listed
   3. Use the "Shower Width" preset
   4. Create a measurement
   ```
   ✅ **Expected**:
   - Spatial features: toilet, sink, shower, tub
   - Preset uses appropriate default (3 ft for shower)
   - Measurement labeled correctly
   - Template context preserved

---

## 🔧 DevTools Testing (Advanced)

### Simulating Network Conditions

#### Chrome DevTools Method
```
1. Open DevTools (F12 or Cmd+Opt+I)
2. Go to "Network" tab
3. Find "Throttling" dropdown (usually says "No throttling")
4. Select "Offline"
5. Perform offline tests
6. Return to "No throttling" or "Fast 3G" to simulate reconnection
```

#### Programmatic Testing (Console)
```javascript
// Simulate going offline
window.dispatchEvent(new Event('offline'))

// Simulate going online  
window.dispatchEvent(new Event('online'))

// Check current offline sync status
offlineSyncService.getStatus()

// View pending changes
offlineSyncService.getPendingChanges()

// Force a sync
offlineSyncService.sync()
```

### Testing Collaboration Events (Console)
```javascript
// Create a test session
const session = collaborationService.createSession('test-collection-123')

// Simulate contractor joining
collaborationService.joinSession(session.id, {
  id: 'contractor-test',
  name: 'Test Contractor',
  email: 'test@example.com',
  inviteCode: 'TEST123',
  accessLevel: 'comment'
})

// Get active contractors
collaborationService.getSession(session.id).activeContractors

// Add a test comment
collaborationService.addComment(
  session.id,
  'measurement-123',
  'contractor-test',
  'Test Contractor',
  'This looks good!'
)
```

---

## 📊 Success Criteria Summary

### Live Collaboration
- ✅ Collections can be created and shared
- ✅ Multiple contractors can join sessions
- ✅ Comments appear in real-time
- ✅ Contractors see each other's activity
- ✅ Notifications trigger appropriately

### Offline Sync
- ✅ Offline detection is immediate
- ✅ Measurements save locally when offline
- ✅ Auto-sync occurs on reconnection
- ✅ Sync status indicator is accurate
- ✅ No data loss during offline periods

### AR Room Templates
- ✅ 8 room templates available
- ✅ Spatial recognition analyzes dimensions
- ✅ Confidence scoring is accurate
- ✅ Template-specific presets load correctly
- ✅ Measurements apply template context

---

## 🐛 Known Issues & Limitations

1. **Live Collaboration**
   - Currently simulated for single-user testing
   - In production, would require WebSocket or Firebase integration
   - Cursor tracking visible in UI but position updates are simulated

2. **Offline Sync**
   - localStorage has size limits (~5-10MB per domain)
   - Large measurement datasets may need IndexedDB migration
   - Sync conflicts not yet handled (last-write-wins)

3. **AR Room Templates**
   - Spatial recognition based on dimensions only (no ML vision)
   - Confidence calculation is algorithmic, not ML-based
   - Complex room shapes (L-shaped, etc.) may have lower confidence
   - Camera-based spatial scanning requires future WebXR integration

---

## 💡 Tips for Best Results

### Live Collaboration
- Create collections with descriptive names and tags
- Use "View & Comment" access for read-only contractors  
- Check the activity feed to see recent events
- Resolve comments as issues are addressed

### Offline Mode
- Test with at least 3-5 measurements for realistic scenarios
- Monitor the sync indicator before going offline
- Wait a few seconds after reconnecting for sync to complete
- Use DevTools Network tab for consistent offline testing

### AR Room Templates
- Take measurements of actual room dimensions for accurate detection
- Use the "Analyze Space" button after measuring width, length, height
- Higher confidence (>80%) indicates better room match
- Fallback to manual template selection if confidence is low
- Each template's presets are optimized for that room type

---

## 🎉 Testing Complete!

Once you've completed all test scenarios:

1. **Verify** all expected outcomes matched actual results
2. **Document** any discrepancies or bugs found
3. **Note** performance observations
4. **Suggest** improvements or additional features

For questions or issues, refer to the main project documentation or create an issue in the repository.

---

**Last Updated**: ${new Date().toISOString().split('T')[0]}
**Version**: 1.0.0
**Features**: Live Collaboration | Offline Sync | AR Room Templates
