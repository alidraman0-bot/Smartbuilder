# API Keys Setup Guide

This guide will help you configure API keys for the Smartbuilder MVP application to enable advanced AI capabilities.

## Quick Setup

1. **Copy the template file to create your .env file:**
   ```bash
   copy env.template .env
   ```
   Or manually create a `.env` file in the project root.

2. **Open the `.env` file and add your API keys:**
   - Replace `your_openai_api_key_here` with your actual OpenAI API key
   - (Optional) Replace `your_anthropic_api_key_here` with your Anthropic API key
   - (Optional) Replace `your_google_api_key_here` with your Google API key

3. **At minimum, you need ONE of the following API keys configured:**
   - **OpenAI API Key** (recommended for beginners)
   - **Anthropic Claude API Key** (great for advanced reasoning)
   - **Google Gemini API Key** (cost-effective option)

## Getting API Keys

### OpenAI
- Visit: https://platform.openai.com/api-keys
- Sign up or log in to your OpenAI account
- Click "Create new secret key"
- Copy the key and paste it into your `.env` file

### Anthropic Claude
- Visit: https://console.anthropic.com/
- Sign up or log in to your Anthropic account
- Navigate to API Keys section
- Create a new API key
- Copy the key and paste it into your `.env` file

### Google Gemini
- Visit: https://makersuite.google.com/app/apikey
- Sign in with your Google account
- Click "Create API Key"
- Copy the key and paste it into your `.env` file

## Configuration Options

### Primary AI Provider
Set `AI_PROVIDER` in your `.env` file to choose your primary provider:
- `openai` - OpenAI (default)
- `anthropic` - Anthropic Claude
- `gemini` - Google Gemini

### Advanced Settings
- **TEMPERATURE**: Controls creativity (0.0 = focused, 1.0 = creative)
- **MAX_TOKENS**: Maximum response length
- **ENABLE_FALLBACK**: Automatically use backup providers if primary fails

### Model Selection
Each provider supports different models. Update the model name in your `.env` file:

**OpenAI Models:**
- `gpt-4-turbo-preview` - Latest GPT-4 Turbo
- `gpt-4o` - Latest GPT-4 Optimized
- `gpt-4o-mini` - Faster, cost-effective
- `gpt-3.5-turbo` - Fast and economical

**Anthropic Models:**
- `claude-3-5-sonnet-20241022` - Latest Claude Sonnet (recommended)
- `claude-3-opus-20240229` - Most capable
- `claude-3-sonnet-20240229` - Balanced performance

**Gemini Models:**
- `gemini-1.5-pro` - Most capable (recommended)
- `gemini-1.5-flash` - Fast and efficient
- `gemini-pro` - Standard version

## Installation

After setting up your `.env` file, install the additional AI provider packages:

```bash
pip install -r requirements.txt
```

This will install:
- `openai` - OpenAI SDK
- `anthropic` - Anthropic Claude SDK
- `google-generativeai` - Google Gemini SDK

## Testing Your Setup

Once configured, restart your FastAPI backend server. The application will:
1. Load API keys from your `.env` file
2. Initialize the configured AI providers
3. Use the primary provider you selected
4. Automatically fallback to other providers if the primary fails (if enabled)

## Security Notes

- **Never commit your `.env` file to version control**
- The `.gitignore` file is already configured to exclude `.env`
- Keep your API keys secure and don't share them
- Rotate your API keys regularly if exposed

## Troubleshooting

### "No AI clients initialized"
- Make sure you've added at least one API key to your `.env` file
- Verify the key is correct (no extra spaces or quotes)
- Restart the server after updating `.env`

### "Provider failed" errors
- Check your API key is valid and has credits/quota
- Verify you have internet connectivity
- Try a different provider if one is having issues
- Enable fallback (`ENABLE_FALLBACK=true`) to automatically use backups

### Import errors
- Run `pip install -r requirements.txt` to install all required packages
- Make sure you're using Python 3.8 or higher

