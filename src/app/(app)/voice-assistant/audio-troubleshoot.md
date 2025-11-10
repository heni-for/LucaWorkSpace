# LUCA Voice Not Speaking - Troubleshooting Guide

## ✅ What's Working:
- Code executes correctly
- Speech API activates (Speaking status: true)
- Speech starts and ends successfully
- 25 voices available

## ❌ Problem:
You can't HEAR the audio output

## 🔧 Windows Audio Fixes:

### Fix 1: Check System Volume
1. Look at bottom-right corner of screen
2. Click speaker icon 🔊
3. Drag slider to 75% or higher
4. Click speaker icon to unmute if needed

### Fix 2: Windows Volume Mixer (MOST COMMON ISSUE)
1. Right-click speaker icon (bottom-right)
2. Click "Open Volume Mixer"
3. Look for your browser (Chrome/Edge/Firefox)
4. Make sure:
   - Browser volume slider is UP (not at 0)
   - Browser is NOT muted
   - System Sounds volume is UP

### Fix 3: Check Output Device
1. Right-click speaker icon
2. Click "Open Sound Settings"
3. Under "Choose your output device"
4. Make sure correct speakers/headphones selected
5. Click "Test" button - do you hear test sound?

### Fix 4: Browser Tab Muted
1. Look at browser tab title
2. If you see 🔇 icon on the tab, it's MUTED
3. Right-click the tab → "Unmute site"

### Fix 5: Browser Settings
1. Chrome: Settings → Privacy and Security → Site Settings → Sound
2. Make sure sound is ALLOWED
3. Check if localhost is blocked

### Fix 6: Test with Different Browser
1. Try Microsoft Edge (best for Windows TTS)
2. Or Chrome Incognito mode (Ctrl+Shift+N)

### Fix 7: Windows Audio Service
1. Press Win+R
2. Type: services.msc
3. Find "Windows Audio"
4. Make sure Status is "Running"
5. If not, right-click → Start

## 🧪 Quick Test:
1. Open YouTube in another tab
2. Play any video
3. Can you hear it?
   - YES → Browser audio works, might be TTS-specific issue
   - NO → System audio problem

## 💡 Most Likely Issue:
**Browser is muted in Windows Volume Mixer!**
This is the #1 cause. Check Volume Mixer!

