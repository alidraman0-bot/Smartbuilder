# API Keys Verification Guide

Great! You've added your API keys. Here's how to verify everything is working:

## ✅ Quick Verification Steps

### 1. **Check Your API Keys Status**

Run this command to verify your keys are properly configured:
```bash
python verify_api_keys.py
```

This will show you:
- Which providers have keys configured
- Primary AI provider setting
- Whether everything is properly set up

### 2. **Via the Settings UI (Recommended)**

1. Navigate to **Settings** in the sidebar (or go to `/settings`)
2. You should see your current API key status
3. The status badges will show which providers are configured:
   - ✅ Green = Configured
   - ❌ Gray = Not Set

### 3. **Check the API Endpoint**

You can also check the API directly:
```bash
curl http://127.0.0.1:8000/api/v1/settings/keys/status
```

## 🔄 Important: Server Restart Required

After adding API keys, you need to **restart the backend server** for the changes to take full effect:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

## 📝 How to Add Keys (If Not Done Yet)

### Option 1: Via Settings UI (Easiest)
1. Go to `/settings` in your browser
2. Enter your API keys in the form fields
3. Click "Test" to verify each key works
4. Click "Save Configuration"
5. Restart the server

### Option 2: Manual .env File Edit
1. Open `.env` file in the project root
2. Replace the placeholder values:
   ```
   OPENAI_API_KEY=your_actual_key_here
   ANTHROPIC_API_KEY=your_actual_key_here
   GOOGLE_API_KEY=your_actual_key_here
   ```
3. Save the file
4. Restart the server

## ✅ Verification Checklist

- [ ] At least one API key is configured
- [ ] The `.env` file contains the keys (not placeholders)
- [ ] Server has been restarted after adding keys
- [ ] Settings page shows keys as "Configured"
- [ ] AI clients are initialized (check Settings page status)

## 🧪 Test Your Configuration

After restarting, you can test if everything works:

1. **Check Settings Page**: Visit `/settings` - should show configured providers
2. **Test API Endpoint**: The status endpoint should show `has_any_key: true`
3. **Try AI Features**: Test any AI-powered feature in your app

## 🚀 Next Steps

Once your API keys are verified and working:

1. ✅ **AI Features Enabled**: The app can now use AI for:
   - Idea generation
   - Research and validation
   - Business plan creation
   - PRD generation
   - MVP building

2. ✅ **Multi-Provider Support**: If you've added multiple keys:
   - Primary provider will be used first
   - Automatic fallback if primary fails (if enabled)

3. ✅ **Advanced Configuration**: 
   - Adjust temperature for creativity
   - Set max tokens for response length
   - Choose different models per provider
   - Enable/disable fallback providers

## ⚠️ Troubleshooting

### Keys not detected after restart?
- Check `.env` file exists in project root
- Verify keys are not placeholders (`your_*_api_key_here`)
- Ensure no extra spaces or quotes around keys
- Check file encoding is UTF-8

### "No AI clients initialized"?
- At least one API key must be configured
- Verify the key format is correct for each provider
- Check for typos in the `.env` file
- Restart the server

### Settings page shows "Not Set"?
- Make sure you clicked "Save Configuration" after entering keys
- Check the `.env` file was updated correctly
- Verify server has been restarted

## 📞 Need Help?

If you're still having issues:
1. Check the `.env` file format
2. Verify API keys are valid and not expired
3. Check server logs for any error messages
4. Try the test buttons in the Settings UI

---

**Note**: API keys are stored in `.env` file (which is gitignored for security). Never commit API keys to version control!

