import boto3
import json
import time

polly = boto3.client('polly', region_name='us-east-1')

# All supported languages
languages = {
    'hi-IN': {'name': 'Hindi', 'voice': 'Aditi', 'greeting': 'नमस्ते'},
    'ta-IN': {'name': 'Tamil', 'voice': 'Kajal', 'greeting': 'வணக்கம்'},
    'te-IN': {'name': 'Telugu', 'voice': 'Kajal', 'greeting': 'నమస్కారం'},
    'bn-IN': {'name': 'Bengali', 'voice': 'Aditi', 'greeting': 'নমস্কার'},
    'mr-IN': {'name': 'Marathi', 'voice': 'Aditi', 'greeting': 'नमस्कार'},
    'gu-IN': {'name': 'Gujarati', 'voice': 'Aditi', 'greeting': 'નમસ્તે'},
    'kn-IN': {'name': 'Kannada', 'voice': 'Kajal', 'greeting': 'ನಮಸ್ಕಾರ'},
    'ml-IN': {'name': 'Malayalam', 'voice': 'Kajal', 'greeting': 'നമസ്കാരം'},
    'en-IN': {'name': 'English (India)', 'voice': 'Kajal', 'greeting': 'Hello'}
}

def test_language_voice(lang_code, lang_info):
    """Test voice synthesis for a specific language"""
    
    print(f"\nTesting {lang_info['name']} ({lang_code})...")
    print("-" * 60)
    print(f"Voice: {lang_info['voice']}")
    print(f"Greeting: {lang_info['greeting']}")
    
    # Simple test text
    test_text = f"{lang_info['greeting']}, मैं शी बैलेंस की एआई सखी हूँ।"
    
    try:
        # Synthesize speech
        response = polly.synthesize_speech(
            Text=test_text,
            OutputFormat='mp3',
            VoiceId=lang_info['voice'],
            LanguageCode=lang_code,
            Engine='neural'
        )
        
        # Save audio file
        filename = f'test_voice_{lang_code.replace("-", "_")}.mp3'
        with open(filename, 'wb') as file:
            file.write(response['AudioStream'].read())
        
        print(f"✅ Voice synthesis successful!")
        print(f"   File: {filename}")
        print(f"   Voice: {lang_info['voice']} (Neural)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    """Test all languages"""
    
    print("=" * 60)
    print("Multi-Language Voice Service Test")
    print("=" * 60)
    print(f"\nTesting {len(languages)} languages...")
    print()
    
    results = {}
    
    for lang_code, lang_info in languages.items():
        results[lang_info['name']] = test_language_voice(lang_code, lang_info)
        time.sleep(1)  # Small delay between tests
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = 0
    for name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if success:
            passed += 1
    
    print(f"\nTotal: {passed}/{len(results)} languages working")
    print()
    
    if passed == len(results):
        print("🎉 All languages working perfectly!")
    else:
        print("⚠️ Some languages failed. Check errors above.")
    
    print("\n📁 Generated MP3 files:")
    print("   Listen to these files to verify voice quality!")
    for lang_code in languages.keys():
        filename = f'test_voice_{lang_code.replace("-", "_")}.mp3'
        print(f"   - {filename}")
    
    print("\n✅ Test complete!")

if __name__ == '__main__':
    main()
