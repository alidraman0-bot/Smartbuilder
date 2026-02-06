"""
Quick verification script to check if API keys are properly configured.
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_api_keys():
    """Check which API keys are configured."""
    print("=" * 60)
    print("API Keys Configuration Status")
    print("=" * 60)
    
    # Check OpenAI
    openai_key = os.getenv("OPENAI_API_KEY", "")
    has_openai = bool(openai_key and openai_key != "your_openai_api_key_here" and len(openai_key) > 10)
    print(f"\n[OK] OpenAI API Key: {'CONFIGURED' if has_openai else 'NOT SET'}")
    if has_openai:
        print(f"  Key preview: {openai_key[:10]}...{openai_key[-4:]}")
    
    # Check Anthropic
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
    has_anthropic = bool(anthropic_key and anthropic_key != "your_anthropic_api_key_here" and len(anthropic_key) > 10)
    print(f"\n[OK] Anthropic Claude API Key: {'CONFIGURED' if has_anthropic else 'NOT SET'}")
    if has_anthropic:
        print(f"  Key preview: {anthropic_key[:10]}...{anthropic_key[-4:]}")
    
    # Check Google
    google_key = os.getenv("GOOGLE_API_KEY", "")
    has_google = bool(google_key and google_key != "your_google_api_key_here" and len(google_key) > 10)
    print(f"\n[OK] Google Gemini API Key: {'CONFIGURED' if has_google else 'NOT SET'}")
    if has_google:
        print(f"  Key preview: {google_key[:10]}...{google_key[-4:]}")
    
    # Check E2B
    e2b_key = os.getenv("E2B_API_KEY", "")
    has_e2b = bool(e2b_key and e2b_key != "your_e2b_api_key" and len(e2b_key) > 10)
    print(f"\n[OK] E2B API Key: {'CONFIGURED' if has_e2b else 'NOT SET'}")
    if has_e2b:
        print(f"  Key preview: {e2b_key[:5]}...{e2b_key[-4:]}")
        
    # Check Base44
    base44_key = os.getenv("BASE44_API_KEY", "")
    has_base44 = bool(base44_key and base44_key != "your_base44_api_key" and len(base44_key) > 10)
    print(f"\n[OK] Base44 API Key: {'CONFIGURED' if has_base44 else 'NOT SET'}")
    
    # Summary
    print("\n" + "=" * 60)
    total_configured = sum([has_openai, has_anthropic, has_google, has_e2b, has_base44])
    print(f"Total Providers Configured: {total_configured}/5")
    
    if total_configured > 0:
        print("\n[SUCCESS] At least one API key is configured!")
        print("[SUCCESS] The app should now have AI capabilities enabled.")
        
        # Check AI Provider setting
        ai_provider = os.getenv("AI_PROVIDER", "openai")
        print(f"\nPrimary AI Provider: {ai_provider.upper()}")
        
        # Verify the configured provider has a key
        provider_keys = {
            "openai": has_openai,
            "anthropic": has_anthropic,
            "gemini": has_google
        }
        
        if provider_keys.get(ai_provider, False):
            print(f"[OK] Primary provider '{ai_provider}' has a configured key!")
        else:
            print(f"[WARNING] Primary provider '{ai_provider}' does not have a key configured.")
            print("  Consider either:")
            print(f"  1. Adding a {ai_provider} API key")
            print(f"  2. Changing AI_PROVIDER to one of the configured providers")
    else:
        print("\n[WARNING] No API keys are configured!")
        print("  Please add at least one API key to use AI features.")
        print("\n  You can add keys either:")
        print("  1. Via the Settings page in the UI (recommended)")
        print("  2. Manually edit the .env file")
    
    print("=" * 60)
    print("\nNote: You may need to restart the server for changes to take full effect.")
    print("=" * 60)

if __name__ == "__main__":
    check_api_keys()

