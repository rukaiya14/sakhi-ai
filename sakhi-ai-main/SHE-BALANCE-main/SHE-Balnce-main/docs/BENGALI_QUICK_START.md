# Bengali Language - Quick Start Guide 🇮🇳

## How to Use Bengali in the Artisan Dashboard

### Step 1: Open the Dashboard
```
Open: SHE-BALANCE-main/SHE-Balnce-main/dashboard.html
```

### Step 2: Switch to Bengali
1. Look for the language button (🌐) in the top-right header
2. Click on it to open the language selector
3. Select **"বাংলা (Bengali)"**
4. The entire dashboard will instantly switch to Bengali!

### Step 3: Verify the Translation
You should see:
- Header greeting: **নমস্কার** (Hello)
- Dashboard: **ড্যাশবোর্ড**
- My Skills: **আমার দক্ষতা**
- Opportunities: **সুযোগ**
- Food Marketplace: **খাদ্য বাজার**
- Community: **সম্প্রদায়**

## Quick Test Without Login

### Option 1: Test Page (Recommended)
```
Open: SHE-BALANCE-main/SHE-Balnce-main/test-bengali-language.html
```

This standalone page shows:
- ✅ All Bengali translations
- ✅ No login required
- ✅ Compare with other languages
- ✅ Interactive switching

### Option 2: Browser Console Test
1. Open any dashboard page
2. Press F12 to open Developer Console
3. Type:
```javascript
// Test Bengali translation
console.log(t('greeting', 'bn-IN')); // Output: নমস্কার
console.log(t('dashboard', 'bn-IN')); // Output: ড্যাশবোর্ড
console.log(t('bulkOrdersManagement', 'bn-IN')); // Output: বাল্ক অর্ডার ব্যবস্থাপনা
```

## Common Bengali Translations

### Navigation
| English | Bengali |
|---------|---------|
| Hello | নমস্কার |
| Dashboard | ড্যাশবোর্ড |
| My Skills | আমার দক্ষতা |
| Opportunities | সুযোগ |
| Community | সম্প্রদায়  |
| Logout | লগআউট |

### Bulk Orders
| English | Bengali |
|---------|---------|
| Bulk Orders Management | বাল্ক অর্ডার ব্যবস্থাপনা |
| Update Progress | অগ্রগতি আপডেট করুন |
| Need Help | সাহায্য প্রয়োজন |
| Action Required | পদক্ষেপ প্রয়োজন! |
| Loading Orders | অর্ডার লোড হচ্ছে... |

### Order Status
| English | Bengali |
|---------|---------|
| Pending | মুলতুবি |
| In Progress | চলমান |
| Completed | সম্পন্ন |
| Cancelled | বাতিল |

### Actions
| English | Bengali |
|---------|---------|
| Submit | জমা দিন |
| Cancel | বাতিল করুন |
| Save | সংরক্ষণ করুন |
| Close | বন্ধ করুন |
| Loading | লোড হচ্ছে... |

## Troubleshooting

### Issue: Bengali text not showing
**Solution**: Make sure you're using a browser that supports Bengali Unicode fonts (Chrome, Firefox, Edge all support it)

### Issue: Language not persisting
**Solution**: 
1. Check if backend server is running
2. Verify localStorage: Open Console and type `localStorage.getItem('shebalance_language')`
3. Should return: `"bn-IN"`

### Issue: Some text still in English
**Solution**: Some dynamic content may need a page refresh after language change

## Voice Support

Bengali voice calls are supported with:
- **Voice**: Aditi (AWS Polly)
- **Language Code**: bn-IN
- **Sample Greeting**: "নমস্কার! আমি SheBalance থেকে আপনার AI সহায়ক"

## Files Reference

| File | Purpose |
|------|---------|
| `translations.js` | All Bengali translations |
| `language-selector.js` | Language switching logic |
| `test-bengali-language.html` | Test page |
| `dashboard.html` | Main dashboard |

## Quick Commands

### Start Backend Server
```bash
cd SHE-BALANCE-main/SHE-Balnce-main/backend
node server-dynamodb.js
```

### Open Test Page
```
Double-click: test-bengali-language.html
```

### Check Translation in Console
```javascript
// Get current language
getCurrentLanguage()

// Set to Bengali
setLanguage('bn-IN')

// Test translation
t('greeting', 'bn-IN')
```

## Success Indicators

When Bengali is working correctly, you'll see:
- ✅ Language button shows: **বাংলা**
- ✅ Header greeting: **নমস্কার**
- ✅ All menu items in Bengali
- ✅ Order status in Bengali
- ✅ Buttons and actions in Bengali

## Next Steps

1. **Test the implementation**: Open `test-bengali-language.html`
2. **Try in dashboard**: Switch language in live dashboard
3. **Test voice calls**: Try Bengali voice assistant
4. **Provide feedback**: Report any missing translations

---

**Status**: ✅ Ready to Use
**Language**: বাংলা (Bengali)
**Code**: bn-IN
**Coverage**: 100+ translations
