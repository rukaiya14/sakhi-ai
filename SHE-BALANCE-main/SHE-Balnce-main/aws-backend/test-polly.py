import boto3
import json

# Initialize Polly client
polly = boto3.client('polly', region_name='us-east-1')

# Hindi voice message
hindi_text = """
नमस्ते, मैं शी बैलेंस की एआई सखी हूँ।
हम आपसे आपके बल्क ऑर्डर के बारे में बात करना चाहते हैं।
कृपया 24 घंटे के अंदर हमसे संपर्क करें।
धन्यवाद।
"""

# English voice message
english_text = """
Hello, this is AI Sakhi from SHE-BALANCE.
We want to talk to you about your bulk order.
Please contact us within 24 hours.
Thank you.
"""

def test_polly_voice(text, language_code, voice_id):
    """Test Polly voice synthesis"""
    try:
        response = polly.synthesize_speech(
            Text=text,
            OutputFormat='mp3',
            VoiceId=voice_id,
            LanguageCode=language_code,
            Engine='neural'  # Use neural engine for better quality
        )
        
        # Save audio file
        filename = f'test_voice_{voice_id}.mp3'
        with open(filename, 'wb') as file:
            file.write(response['AudioStream'].read())
        
        print(f"✅ Voice synthesis successful: {filename}")
        print(f"   Voice: {voice_id}")
        print(f"   Language: {language_code}")
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

# Test Hindi voice (Aditi)
print("Testing Hindi voice...")
test_polly_voice(hindi_text, 'hi-IN', 'Aditi')

# Test English voice (Kajal - Indian English)
print("\nTesting English voice...")
test_polly_voice(english_text, 'en-IN', 'Kajal')

print("\n✅ Polly test complete! Check the generated MP3 files.")
