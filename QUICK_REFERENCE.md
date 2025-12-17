# Quick Reference: New Collaboration Features

## 🎯 Three New Superpowers

### 1️⃣ Real-time Collaboration
**What**: Multiple contractors view & comment on measurements simultaneously  
**Where**: Contractor Workspace → Share Collection → Live Collaboration button  
**Best For**: Remote team coordination, on-site collaboration

**Quick Actions:**
- 👥 See who's online (colored avatars)
- 💬 Comment on any measurement
- ✅ Resolve comments when done
- 📡 Watch live activity feed

---

### 2️⃣ Offline Mode
**What**: Work without internet, auto-sync when reconnected  
**Where**: Always active (bottom-right indicator)  
**Best For**: Field measurements, basements, rural properties

**Status Colors:**
- 🟢 Green = All synced
- 🟡 Yellow = Changes pending
- 🔴 Red = Offline mode
- 🔄 Spinning = Syncing now

**Pro Tip:** Click indicator to see details & retry failed syncs

---

### 3️⃣ AR Room Templates
**What**: AI detects room type & suggests smart measurements  
**Where**: AR Property Viewer → Room Templates button  
**Best For**: Consistent measurements, faster workflows

**Room Types:**
- 🍳 Kitchen
- 🛏️ Bedroom  
- 🚿 Bathroom
- 🛋️ Living Room
- 🍽️ Dining Room
- 💼 Office
- 🚪 Hallway
- 👔 Closet

**Two Ways to Use:**
1. **Auto-Detect**: Take 3 measurements (width, length, height) → Click "Analyze Space"
2. **Manual Select**: Browse templates → Pick room type → Choose measurement

---

## ⚡ Quick Workflows

### Workflow 1: Field Measurement Collection
```
1. Open AR Property Viewer
2. Click "Room Templates"
3. Take width/length/height measurements
4. Click "Analyze Space" (AI detects room)
5. Use suggested measurements
6. Work offline if needed
7. Auto-syncs when back online
```

### Workflow 2: Team Collaboration
```
1. Create Measurement Collection
2. Add measurements from property
3. Click "Share" → Select contractors
4. Contractors click "Live Collaboration"
5. Everyone sees updates in real-time
6. Add/resolve comments together
```

### Workflow 3: Template-Based Measuring
```
1. Click "Room Templates" in AR viewer
2. Select room type (or let AI detect)
3. Choose measurement preset
4. Tap two points to measure
5. Repeat for all presets
6. Export collection when done
```

---

## 🎓 Pro Tips

1. **Offline First**: Always assume you'll lose signal - it auto-syncs
2. **Analyze Early**: Take 3 basic dimensions before detailed measurements  
3. **Template Consistency**: Use templates for standardized reporting
4. **Collaborate Smart**: Share before arriving on-site
5. **Comment Context**: Add photos/voice notes to measurement comments
6. **Check Sync Status**: Glance at indicator before leaving properties

---

## 🆘 Troubleshooting

### "Offline" showing but I'm connected?
→ Click indicator → Check connection status → Retry sync if needed

### Room detection confidence low?
→ Double-check your measurements are accurate
→ Try manual template selection instead

### Contractor not showing in Live Collaboration?
→ Ensure they've accepted the invite
→ Check they clicked "Live Collaboration" button
→ Verify collection is shared with them

### Measurements not syncing?
→ Click sync indicator → View pending changes
→ Check internet connection
→ Try manual "Retry Failed Syncs"

---

## 📱 Mobile Best Practices

- Use landscape mode for AR measurements
- Enable location services for better accuracy
- Keep phone steady when taking measurements
- Use two-finger gestures for pinch-to-zoom
- Tap firmly for measurement points

---

## 🔐 Privacy & Permissions

**What's Stored Locally:**
- Your measurements
- Pending offline changes
- Measurement annotations

**What's Shared in Collaboration:**
- Measurement data only
- Comments and annotations
- Cursor positions (temporary)

**Not Shared:**
- Property owner information
- Private documents
- User credentials

---

## 🚀 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Toggle Measurement Mode | `M` |
| Clear Measurements | `C` |
| Save Snapshot | `S` |
| Toggle Info | `I` |
| Exit AR View | `Esc` |
| Send Comment | `Enter` |
| Cancel Comment | `Esc` |

---

## 📊 When to Use What

**Use Real-time Collaboration when:**
- Multiple people need to review measurements
- You need instant feedback from experts
- Coordinating complex renovation projects

**Use Offline Mode when:**
- Working in basements or rural areas
- Internet is unreliable
- Want to minimize data usage

**Use Room Templates when:**
- Need consistent measurement naming
- Want faster measurement workflows
- Creating reports for clients
- Training new team members

---

## 💡 Advanced Features

### Custom Room Templates
Edit `spatial-recognition-service.ts` to add your own room types with custom measurements

### Batch Operations
Use Batch Export to share multiple properties at once with contractors

### Measurement Annotations
Add photos, voice notes, and text to any measurement for context

### Comparison Views
Side-by-side property comparisons with synchronized measurements

---

**Need Help?** See [COLLABORATION_FEATURES.md](./COLLABORATION_FEATURES.md) for full documentation
