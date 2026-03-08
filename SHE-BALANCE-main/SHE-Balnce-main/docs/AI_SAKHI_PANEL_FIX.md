# 🤖 AI Sakhi Panel - Troubleshooting Guide

## Issue
Clicking "AI Sakhi Assistant" in the dashboard doesn't open the side panel.

## Quick Test

### Step 1: Test the Panel Standalone
Open this test page:
```
http://localhost:8080/test-ai-sakhi-panel.html
```

Click "Open AI Sakhi Panel" button. If it works here, the code is correct and it's a dashboard-specific issue.

### Step 2: Check Dashboard Console
1. Open dashboard: `http://localhost:8080/dashboard.html`
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Click on "AI Sakhi Assistant" in the sidebar
5. Look for any error messages (red text)

## Common Issues & Solutions

### Issue 1: JavaScript Error
**Symptom**: Console shows errors when clicking
**Solution**: Check if there's a JavaScript error earlier in the page that prevents dashboard.js from loading

**Test in Console**:
```javascript
typeof openAISakhi
// Should return: "function"
// If returns: "undefined", the function isn't loaded
```

### Issue 2: Elements Not Found
**Symptom**: Console shows "Cannot read property 'classList' of null"
**Solution**: The HTML elements might not exist

**Test in Console**:
```javascript
document.getElementById('aiSakhiPanel')
// Should return: <div id="aiSakhiPanel" class="ai-sakhi-panel">
// If returns: null, the element doesn't exist
```

### Issue 3: CSS Not Loaded
**Symptom**: Panel appears but doesn't slide in
**Solution**: CSS might not be loaded properly

**Test in Console**:
```javascript
const panel = document.getElementById('aiSakhiPanel');
getComputedStyle(panel).right
// Should return: "-450px" (when closed)
```

### Issue 4: Z-Index Issue
**Symptom**: Panel opens but is behind other elements
**Solution**: Check z-index values

**Test in Console**:
```javascript
const panel = document.getElementById('aiSakhiPanel');
getComputedStyle(panel).zIndex
// Should return: "2000"
```

## Manual Test

Open browser console (F12) and run:

```javascript
// Test 1: Check if function exists
console.log('Function exists:', typeof openAISakhi === 'function');

// Test 2: Check if elements exist
console.log('Panel exists:', !!document.getElementById('aiSakhiPanel'));
console.log('Overlay exists:', !!document.getElementById('aiSakhiOverlay'));

// Test 3: Try to open manually
try {
    openAISakhi();
    console.log('✅ Panel opened successfully!');
} catch (error) {
    console.error('❌ Error opening panel:', error);
}
```

## Expected Behavior

When clicking "AI Sakhi Assistant":
1. Side panel slides in from the right
2. Dark overlay appears over the page
3. Page scrolling is disabled
4. Panel shows welcome message

## Quick Fix

If the panel doesn't work, you can manually trigger it from console:

```javascript
// Open panel
document.getElementById('aiSakhiPanel').classList.add('active');
document.getElementById('aiSakhiOverlay').classList.add('active');
document.body.style.overflow = 'hidden';

// Close panel
document.getElementById('aiSakhiPanel').classList.remove('active');
document.getElementById('aiSakhiOverlay').classList.remove('active');
document.body.style.overflow = 'auto';
```

## Debugging Steps

### 1. Clear Cache
```
Ctrl + Shift + Delete
Select "Cached images and files"
Click "Clear data"
```

### 2. Hard Refresh
```
Ctrl + F5 (Windows)
Cmd + Shift + R (Mac)
```

### 3. Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Refresh page
4. Look for dashboard.js - should show status 200
5. Look for dashboard.css - should show status 200

### 4. Check for Conflicts
Look for JavaScript errors in console that might prevent the script from loading:
- Syntax errors
- Missing dependencies
- Conflicting scripts

## Files to Check

1. **dashboard.html** (line 29)
   ```html
   <a href="#" class="nav-item" onclick="openAISakhi(); return false;">
   ```

2. **dashboard.html** (line 660)
   ```html
   <div id="aiSakhiPanel" class="ai-sakhi-panel">
   ```

3. **dashboard.js** (line 255)
   ```javascript
   function openAISakhi() {
   ```

4. **dashboard.css** (line 4532)
   ```css
   .ai-sakhi-panel {
   ```

## Test Results

Run the test page and report:
- ✅ Test page works → Dashboard-specific issue
- ❌ Test page doesn't work → Code issue

## Next Steps

If test page works but dashboard doesn't:
1. Check browser console for errors
2. Verify dashboard.js is loaded (Network tab)
3. Check if there's a JavaScript error before openAISakhi is defined
4. Try opening panel manually from console

If test page doesn't work:
1. Check if CSS is loaded
2. Verify element IDs match
3. Check browser compatibility
4. Try different browser

---

**Quick Test**: Open `http://localhost:8080/test-ai-sakhi-panel.html` now!
