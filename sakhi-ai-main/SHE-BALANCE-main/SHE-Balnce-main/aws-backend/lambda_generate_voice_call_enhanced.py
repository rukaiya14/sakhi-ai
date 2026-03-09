import boto3
import json
import os
from datetime import datetime
from decimal import Decimal

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
polly = boto3.client('polly', region_name='us-east-1')
connect = boto3.client('connect', region_name='us-east-1')
s3 = boto3.client('s3', region_name='us-east-1')

# Configuration
ORDERS_TABLE = os.environ.get('ORDERS_TABLE', 'shebalance-orders')
REMINDERS_TABLE = os.environ.get('REMINDERS_TABLE', 'shebalance-reminders')
USERS_TABLE = os.environ.get('USERS_TABLE', 'shebalance-users')
ARTISAN_PROFILES_TABLE = os.environ.get('ARTISAN_PROFILES_TABLE', 'shebalance-artisan-profiles')

CONNECT_INSTANCE_ID = os.environ.get('CONNECT_INSTANCE_ID', '')
CONNECT_CONTACT_FLOW_ID = os.environ.get('CONNECT_CONTACT_FLOW_ID', '')
CONNECT_SOURCE_PHONE = os.environ.get('CONNECT_SOURCE_PHONE', '')
AUDIO_BUCKET = os.environ.get('AUDIO_BUCKET', 'shebalance-voice-audio')

def lambda_handler(event, context):
    """
    Generate and initiate voice call for order reminder
    """
    try:
        print(f"Event: {json.dumps(event)}")
        
        # Get order ID from event
        order_id = event.get('orderId')
        if not order_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'orderId is required'})
            }
        
        # Get order details
        order = get_order(order_id)
        if not order:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Order not found'})
            }
        
        # Get artisan details
        artisan = get_artisan(order['artisanId'])
        if not artisan:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Artisan not found'})
            }
        
        # Get user details
        user = get_user(artisan['userId'])
        if not user:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'User not found'})
            }
        
        # Check if user has phone number
        if not user.get('phone'):
            print(f"User {user['userId']} has no phone number")
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'User has no phone number'})
            }
        
        # Calculate days since last update
        last_update = order.get('lastProgressUpdate', order.get('createdAt'))
        days_since_update = calculate_days_since(last_update)
        
        # Generate voice message
        language = user.get('preferredLanguage', 'hi-IN')
        voice_script = generate_voice_script(user, order, days_since_update, language)
        
        # Synthesize speech with Polly
        audio_url = synthesize_speech(voice_script, language, order_id)
        
        # If Amazon Connect is configured, initiate call
        call_result = {}
        if CONNECT_INSTANCE_ID and CONNECT_CONTACT_FLOW_ID:
            call_result = initiate_voice_call(
                user['phone'],
                audio_url,
                order_id,
                user['userId']
            )
        else:
            print("Amazon Connect not configured, skipping call initiation")
            call_result = {'ContactId': 'simulated-' + order_id}
        
        # Update reminder record
        update_reminder_status(order_id, 'voice_call_initiated', call_result)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Voice call initiated successfully',
                'orderId': order_id,
                'phoneNumber': user['phone'],
                'contactId': call_result.get('ContactId'),
                'audioUrl': audio_url,
                'language': language,
                'script': voice_script
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def get_order(order_id):
    """Get order from DynamoDB"""
    table = dynamodb.Table(ORDERS_TABLE)
    response = table.get_item(Key={'orderId': order_id})
    return response.get('Item')

def get_artisan(artisan_id):
    """Get artisan profile from DynamoDB"""
    table = dynamodb.Table(ARTISAN_PROFILES_TABLE)
    response = table.get_item(Key={'artisanId': artisan_id})
    return response.get('Item')

def get_user(user_id):
    """Get user from DynamoDB"""
    table = dynamodb.Table(USERS_TABLE)
    response = table.get_item(Key={'userId': user_id})
    return response.get('Item')

def calculate_days_since(timestamp):
    """Calculate days since timestamp"""
    from datetime import datetime, timezone
    if isinstance(timestamp, str):
        last_update = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    else:
        last_update = datetime.fromtimestamp(timestamp, tz=timezone.utc)
    now = datetime.now(timezone.utc)
    return (now - last_update).days

def generate_voice_script(user, order, days_since_update, language):
    """Generate voice script in appropriate language"""
    
    if language == 'hi-IN':
        # Hindi script with SSML
        script = f"""<speak>
<prosody rate="medium" pitch="medium">
नमस्ते {user['fullName']} जी।
<break time="500ms"/>
मैं शी बैलेंस की एआई सखी हूँ।
<break time="500ms"/>
हम आपसे आपके बल्क ऑर्डर के बारे में बात करना चाहते हैं।
<break time="500ms"/>
ऑर्डर का नाम है: {order['title']}
<break time="1s"/>
हमने देखा कि आपने पिछले {days_since_update} दिनों से इस ऑर्डर की प्रोग्रेस अपडेट नहीं की है।
<break time="500ms"/>
हमने आपको व्हाट्सएप पर संदेश भेजा था, लेकिन हमें कोई जवाब नहीं मिला।
<break time="1s"/>
हम जानना चाहते हैं: क्या आप इस ऑर्डर को पूरा कर पाएंगी?
<break time="1s"/>
अगर आपको किसी भी प्रकार की समस्या है, चाहे वह समय की कमी हो, सामग्री की समस्या हो, या कोई व्यक्तिगत कारण हो, तो कृपया हमें बताएं।
<break time="500ms"/>
हम आपकी मदद करना चाहते हैं।
<break time="1s"/>
कृपया 24 घंटे के अंदर हमसे संपर्क करें।
<break time="500ms"/>
आप हमें 1800-XXX-XXXX पर कॉल कर सकती हैं, या व्हाट्सएप पर मैसेज भेज सकती हैं।
<break time="1s"/>
धन्यवाद।
<break time="500ms"/>
शी बैलेंस टीम।
</prosody>
</speak>"""
    
    elif language == 'ta-IN':
        # Tamil script with SSML
        script = f"""<speak>
<prosody rate="medium" pitch="medium">
வணக்கம் {user['fullName']}.
<break time="500ms"/>
நான் ஷீ பேலன்ஸ் AI சகி.
<break time="500ms"/>
உங்கள் மொத்த ஆர்டர் பற்றி பேச விரும்புகிறோம்.
<break time="500ms"/>
ஆர்டர் பெயர்: {order['title']}
<break time="1s"/>
கடந்த {days_since_update} நாட்களாக இந்த ஆர்டரின் முன்னேற்றத்தை நீங்கள் புதுப்பிக்கவில்லை என்பதை கவனித்தோம்.
<break time="500ms"/>
நாங்கள் உங்களுக்கு வாட்ஸ்அப் செய்தி அனுப்பினோம், ஆனால் பதில் கிடைக்கவில்லை.
<break time="1s"/>
இந்த ஆர்டரை முடிக்க முடியுமா என்று தெரிந்து கொள்ள விரும்புகிறோம்.
<break time="1s"/>
ஏதேனும் சிக்கல்கள் இருந்தால், நேரம் இல்லாமல் இருந்தாலும், பொருட்கள் பற்றாக்குறை இருந்தாலும், அல்லது தனிப்பட்ட காரணங்கள் இருந்தாலும், எங்களுக்கு தெரியப்படுத்துங்கள்.
<break time="500ms"/>
நாங்கள் உங்களுக்கு உதவ இங்கே இருக்கிறோம்.
<break time="1s"/>
24 மணி நேரத்திற்குள் எங்களை தொடர்பு கொள்ளுங்கள்.
<break time="500ms"/>
நீங்கள் 1800-XXX-XXXX என்ற எண்ணில் அழைக்கலாம் அல்லது வாட்ஸ்அப் செய்தி அனுப்பலாம்.
<break time="1s"/>
நன்றி.
<break time="500ms"/>
ஷீ பேலன்ஸ் குழு.
</prosody>
</speak>"""
    
    elif language == 'te-IN':
        # Telugu script with SSML
        script = f"""<speak>
<prosody rate="medium" pitch="medium">
నమస్కారం {user['fullName']}.
<break time="500ms"/>
నేను షీ బ్యాలెన్స్ AI సఖి.
<break time="500ms"/>
మీ బల్క్ ఆర్డర్ గురించి మాట్లాడాలనుకుంటున్నాము.
<break time="500ms"/>
ఆర్డర్ పేరు: {order['title']}
<break time="1s"/>
గత {days_since_update} రోజులుగా మీరు ఈ ఆర్డర్ పురోగతిని అప్‌డేట్ చేయలేదని గమనించాము.
<break time="500ms"/>
మేము మీకు వాట్సాప్ సందేశం పంపాము, కానీ ప్రతిస్పందన రాలేదు.
<break time="1s"/>
మీరు ఈ ఆర్డర్‌ను పూర్తి చేయగలరా అని తెలుసుకోవాలనుకుంటున్నాము.
<break time="1s"/>
ఏవైనా సవాళ్లు ఎదుర్కొంటుంటే, సమయ కొరత అయినా, పదార్థాల కొరత అయినా, లేదా వ్యక్తిగత కారణాలు అయినా, దయచేసి మాకు తెలియజేయండి.
<break time="500ms"/>
మేము మీకు సహాయం చేయడానికి ఇక్కడ ఉన్నాము.
<break time="1s"/>
దయచేసి 24 గంటల్లో మమ్మల్ని సంప్రదించండి.
<break time="500ms"/>
మీరు 1800-XXX-XXXX కు కాల్ చేయవచ్చు లేదా వాట్సాప్ సందేశం పంపవచ్చు.
<break time="1s"/>
ధన్యవాదాలు.
<break time="500ms"/>
షీ బ్యాలెన్స్ టీమ్.
</prosody>
</speak>"""
    
    elif language == 'bn-IN':
        # Bengali script with SSML
        script = f"""<speak>
<prosody rate="medium" pitch="medium">
নমস্কার {user['fullName']}.
<break time="500ms"/>
আমি শী ব্যালেন্স AI সখী।
<break time="500ms"/>
আমরা আপনার বাল্ক অর্ডার সম্পর্কে কথা বলতে চাই।
<break time="500ms"/>
অর্ডারের নাম: {order['title']}
<break time="1s"/>
আমরা লক্ষ্য করেছি যে আপনি গত {days_since_update} দিন ধরে এই অর্ডারের অগ্রগতি আপডেট করেননি।
<break time="500ms"/>
আমরা আপনাকে হোয়াটসঅ্যাপ বার্তা পাঠিয়েছিলাম, কিন্তু কোনো উত্তর পাইনি।
<break time="1s"/>
আমরা জানতে চাই: আপনি কি এই অর্ডারটি সম্পূর্ণ করতে পারবেন?
<break time="1s"/>
যদি আপনি কোনো চ্যালেঞ্জের সম্মুখীন হন, সময়ের সীমাবদ্ধতা হোক, উপাদানের ঘাটতি হোক, বা ব্যক্তিগত কারণ হোক, দয়া করে আমাদের জানান।
<break time="500ms"/>
আমরা আপনাকে সাহায্য করতে এখানে আছি।
<break time="1s"/>
দয়া করে 24 ঘন্টার মধ্যে আমাদের সাথে যোগাযোগ করুন।
<break time="500ms"/>
আপনি 1800-XXX-XXXX এ কল করতে পারেন বা হোয়াটসঅ্যাপ বার্তা পাঠাতে পারেন।
<break time="1s"/>
ধন্যবাদ।
<break time="500ms"/>
শী ব্যালেন্স টিম।
</prosody>
</speak>"""
    
    elif language == 'mr-IN':
        # Marathi script with SSML
        script = f"""<speak>
<prosody rate="medium" pitch="medium">
नमस्कार {user['fullName']}.
<break time="500ms"/>
मी शी बॅलन्स AI सखी आहे।
<break time="500ms"/>
आम्हाला तुमच्या मोठ्या ऑर्डरबद्दल बोलायचे आहे।
<break time="500ms"/>
ऑर्डरचे नाव: {order['title']}
<break time="1s"/>
आम्ही लक्षात घेतले की तुम्ही गेल्या {days_since_update} दिवसांपासून या ऑर्डरची प्रगती अपडेट केलेली नाही।
<break time="500ms"/>
आम्ही तुम्हाला व्हाट्सअॅप संदेश पाठवला होता, पण प्रतिसाद मिळाला नाही।
<break time="1s"/>
आम्हाला जाणून घ्यायचे आहे: तुम्ही हा ऑर्डर पूर्ण करू शकता का?
<break time="1s"/>
जर तुम्हाला कोणत्याही आव्हानांचा सामना करावा लागत असेल, वेळेची कमतरता असो, साहित्याची कमतरता असो, किंवा वैयक्तिक कारणे असोत, कृपया आम्हाला कळवा।
<break time="500ms"/>
आम्ही तुम्हाला मदत करण्यासाठी येथे आहोत।
<break time="1s"/>
कृपया 24 तासांच्या आत आमच्याशी संपर्क साधा।
<break time="500ms"/>
तुम्ही 1800-XXX-XXXX वर कॉल करू शकता किंवा व्हाट्सअॅप संदेश पाठवू शकता।
<break time="1s"/>
धन्यवाद।
<break time="500ms"/>
शी बॅलन्स टीम।
</prosody>
</speak>"""
    
    elif language == 'gu-IN':
        # Gujarati script with SSML
        script = f"""<speak>
<prosody rate="medium" pitch="medium">
નમસ્તે {user['fullName']}.
<break time="500ms"/>
હું શી બેલેન્સ AI સખી છું।
<break time="500ms"/>
અમે તમારા બલ્ક ઓર્ડર વિશે વાત કરવા માંગીએ છીએ।
<break time="500ms"/>
ઓર્ડરનું નામ: {order['title']}
<break time="1s"/>
અમે નોંધ્યું છે કે તમે છેલ્લા {days_since_update} દિવસથી આ ઓર્ડરની પ્રગતિ અપડેટ કરી નથી।
<break time="500ms"/>
અમે તમને વોટ્સએપ સંદેશ મોકલ્યો હતો, પરંતુ કોઈ પ્રતિસાદ મળ્યો નથી।
<break time="1s"/>
અમે જાણવા માંગીએ છીએ: શું તમે આ ઓર્ડર પૂર્ણ કરી શકો છો?
<break time="1s"/>
જો તમે કોઈ પડકારોનો સામનો કરી રહ્યા હો, સમયની મર્યાદા હોય, સામગ્રીની અછત હોય, અથવા વ્યક્તિગત કારણો હોય, તો કૃપા કરીને અમને જણાવો।
<break time="500ms"/>
અમે તમને મદદ કરવા માટે અહીં છીએ।
<break time="1s"/>
કૃપા કરીને 24 કલાકની અંદર અમારો સંપર્ક કરો।
<break time="500ms"/>
તમે 1800-XXX-XXXX પર કૉલ કરી શકો છો અથવા વોટ્સએપ સંદેશ મોકલી શકો છો।
<break time="1s"/>
આભાર।
<break time="500ms"/>
શી બેલેન્સ ટીમ।
</prosody>
</speak>"""
    
    elif language == 'kn-IN':
        # Kannada script with SSML
        script = f"""<speak>
<prosody rate="medium" pitch="medium">
ನಮಸ್ಕಾರ {user['fullName']}.
<break time="500ms"/>
ನಾನು ಶೀ ಬ್ಯಾಲೆನ್ಸ್ AI ಸಖಿ.
<break time="500ms"/>
ನಿಮ್ಮ ಬಲ್ಕ್ ಆರ್ಡರ್ ಬಗ್ಗೆ ಮಾತನಾಡಲು ಬಯಸುತ್ತೇವೆ।
<break time="500ms"/>
ಆರ್ಡರ್ ಹೆಸರು: {order['title']}
<break time="1s"/>
ಕಳೆದ {days_since_update} ದಿನಗಳಿಂದ ನೀವು ಈ ಆರ್ಡರ್‌ನ ಪ್ರಗತಿಯನ್ನು ಅಪ್‌ಡೇಟ್ ಮಾಡಿಲ್ಲ ಎಂದು ನಾವು ಗಮನಿಸಿದ್ದೇವೆ।
<break time="500ms"/>
ನಾವು ನಿಮಗೆ ವಾಟ್ಸಾಪ್ ಸಂದೇಶ ಕಳುಹಿಸಿದ್ದೇವೆ, ಆದರೆ ಪ್ರತಿಕ್ರಿಯೆ ಸಿಗಲಿಲ್ಲ।
<break time="1s"/>
ನೀವು ಈ ಆರ್ಡರ್ ಅನ್ನು ಪೂರ್ಣಗೊಳಿಸಬಹುದೇ ಎಂದು ತಿಳಿಯಲು ಬಯಸುತ್ತೇವೆ।
<break time="1s"/>
ನೀವು ಯಾವುದೇ ಸವಾಲುಗಳನ್ನು ಎದುರಿಸುತ್ತಿದ್ದರೆ, ಸಮಯದ ನಿರ್ಬಂಧಗಳಾಗಿರಲಿ, ವಸ್ತುಗಳ ಕೊರತೆಯಾಗಿರಲಿ, ಅಥವಾ ವೈಯಕ್ತಿಕ ಕಾರಣಗಳಾಗಿರಲಿ, ದಯವಿಟ್ಟು ನಮಗೆ ತಿಳಿಸಿ।
<break time="500ms"/>
ನಾವು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇವೆ।
<break time="1s"/>
ದಯವಿಟ್ಟು 24 ಗಂಟೆಗಳಲ್ಲಿ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ।
<break time="500ms"/>
ನೀವು 1800-XXX-XXXX ಗೆ ಕರೆ ಮಾಡಬಹುದು ಅಥವಾ ವಾಟ್ಸಾಪ್ ಸಂದೇಶ ಕಳುಹಿಸಬಹುದು।
<break time="1s"/>
ಧನ್ಯವಾದಗಳು।
<break time="500ms"/>
ಶೀ ಬ್ಯಾಲೆನ್ಸ್ ತಂಡ।
</prosody>
</speak>"""
    
    elif language == 'ml-IN':
        # Malayalam script with SSML
        script = f"""<speak>
<prosody rate="medium" pitch="medium">
നമസ്കാരം {user['fullName']}.
<break time="500ms"/>
ഞാൻ ഷീ ബാലൻസ് AI സഖി ആണ്.
<break time="500ms"/>
നിങ്ങളുടെ ബൾക്ക് ഓർഡറിനെക്കുറിച്ച് സംസാരിക്കാൻ ആഗ്രഹിക്കുന്നു।
<break time="500ms"/>
ഓർഡർ പേര്: {order['title']}
<break time="1s"/>
കഴിഞ്ഞ {days_since_update} ദിവസമായി നിങ്ങൾ ഈ ഓർഡറിന്റെ പുരോഗതി അപ്ഡേറ്റ് ചെയ്തിട്ടില്ലെന്ന് ഞങ്ങൾ ശ്രദ്ധിച്ചു।
<break time="500ms"/>
ഞങ്ങൾ നിങ്ങൾക്ക് വാട്ട്സാപ്പ് സന്ദേശം അയച്ചു, പക്ഷേ പ്രതികരണം ലഭിച്ചില്ല।
<break time="1s"/>
നിങ്ങൾക്ക് ഈ ഓർഡർ പൂർത്തിയാക്കാൻ കഴിയുമോ എന്ന് അറിയാൻ ആഗ്രഹിക്കുന്നു।
<break time="1s"/>
നിങ്ങൾ എന്തെങ്കിലും വെല്ലുവിളികൾ നേരിടുന്നുണ്ടെങ്കിൽ, സമയ പരിമിതികളോ, വസ്തുക്കളുടെ കുറവോ, അല്ലെങ്കിൽ വ്യക്തിപരമായ കാരണങ്ങളോ ആണെങ്കിൽ, ദയവായി ഞങ്ങളെ അറിയിക്കുക।
<break time="500ms"/>
ഞങ്ങൾ നിങ്ങളെ സഹായിക്കാൻ ഇവിടെയുണ്ട്।
<break time="1s"/>
ദയവായി 24 മണിക്കൂറിനുള്ളിൽ ഞങ്ങളെ ബന്ധപ്പെടുക।
<break time="500ms"/>
നിങ്ങൾക്ക് 1800-XXX-XXXX എന്ന നമ്പറിൽ വിളിക്കാം അല്ലെങ്കിൽ വാട്ട്സാപ്പ് സന്ദേശം അയയ്ക്കാം।
<break time="1s"/>
നന്ദി।
<break time="500ms"/>
ഷീ ബാലൻസ് ടീം।
</prosody>
</speak>"""
    
    else:
        # English (India) script with SSML - Default fallback
        script = f"""<speak>
<prosody rate="medium" pitch="medium">
Hello {user['fullName']}.
<break time="500ms"/>
This is AI Sakhi from SHE-BALANCE.
<break time="500ms"/>
We want to talk to you about your bulk order.
<break time="500ms"/>
Order name: {order['title']}
<break time="1s"/>
We noticed you haven't updated the progress for this order in the last {days_since_update} days.
<break time="500ms"/>
We sent you a WhatsApp message, but we didn't receive a response.
<break time="1s"/>
We want to know: Can you complete this order?
<break time="1s"/>
If you're facing any challenges, whether it's time constraints, material shortages, or personal reasons, please let us know.
<break time="500ms"/>
We're here to help you.
<break time="1s"/>
Please contact us within 24 hours.
<break time="500ms"/>
You can call us at 1800-XXX-XXXX, or send us a WhatsApp message.
<break time="1s"/>
Thank you.
<break time="500ms"/>
Team SHE-BALANCE.
</prosody>
</speak>"""
    
    return script

def synthesize_speech(text, language, order_id):
    """Synthesize speech using Amazon Polly and upload to S3"""
    
    # Select voice based on language - All Indian languages with neural voices
    voice_map = {
        'hi-IN': 'Aditi',      # Hindi (India) - Female, Neural
        'ta-IN': 'Kajal',      # Tamil (India) - Female, Neural (uses Kajal for Tamil)
        'te-IN': 'Kajal',      # Telugu (India) - Female, Neural (uses Kajal for Telugu)
        'bn-IN': 'Aditi',      # Bengali (India) - Female, Neural (uses Aditi for Bengali)
        'mr-IN': 'Aditi',      # Marathi (India) - Female, Neural (uses Aditi for Marathi)
        'gu-IN': 'Aditi',      # Gujarati (India) - Female, Neural (uses Aditi for Gujarati)
        'kn-IN': 'Kajal',      # Kannada (India) - Female, Neural (uses Kajal for Kannada)
        'ml-IN': 'Kajal',      # Malayalam (India) - Female, Neural (uses Kajal for Malayalam)
        'en-IN': 'Kajal',      # English (India) - Female, Neural
        'en-US': 'Joanna'      # English (US) - Female, Neural
    }
    
    voice_id = voice_map.get(language, 'Aditi')
    
    try:
        # Synthesize speech
        response = polly.synthesize_speech(
            Text=text,
            TextType='ssml',  # Use SSML for better control
            OutputFormat='mp3',
            VoiceId=voice_id,
            LanguageCode=language,
            Engine='neural'  # Neural engine for better quality
        )
        
        # Generate S3 key
        timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        s3_key = f'voice-messages/{order_id}/{timestamp}.mp3'
        
        # Upload to S3
        s3.put_object(
            Bucket=AUDIO_BUCKET,
            Key=s3_key,
            Body=response['AudioStream'].read(),
            ContentType='audio/mpeg',
            ServerSideEncryption='AES256'
        )
        
        # Generate presigned URL (valid for 1 hour)
        audio_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': AUDIO_BUCKET, 'Key': s3_key},
            ExpiresIn=3600
        )
        
        print(f"✅ Audio synthesized and uploaded: {s3_key}")
        return audio_url
        
    except Exception as e:
        print(f"❌ Error synthesizing speech: {str(e)}")
        raise

def initiate_voice_call(phone_number, audio_url, order_id, user_id):
    """Initiate voice call via Amazon Connect"""
    
    try:
        # Format phone number (remove spaces, dashes)
        formatted_phone = phone_number.replace(' ', '').replace('-', '')
        if not formatted_phone.startswith('+'):
            formatted_phone = '+91' + formatted_phone  # Assume India if no country code
        
        # Initiate outbound call
        response = connect.start_outbound_voice_contact(
            DestinationPhoneNumber=formatted_phone,
            ContactFlowId=CONNECT_CONTACT_FLOW_ID,
            InstanceId=CONNECT_INSTANCE_ID,
            SourcePhoneNumber=CONNECT_SOURCE_PHONE,
            Attributes={
                'orderId': order_id,
                'userId': user_id,
                'audioUrl': audio_url,
                'callType': 'order_reminder'
            }
        )
        
        print(f"✅ Voice call initiated: {response['ContactId']}")
        return response
        
    except Exception as e:
        print(f"❌ Error initiating voice call: {str(e)}")
        raise

def update_reminder_status(order_id, status, call_result):
    """Update reminder status in DynamoDB"""
    table = dynamodb.Table(REMINDERS_TABLE)
    
    try:
        table.update_item(
            Key={'orderId': order_id},
            UpdateExpression='SET #status = :status, callInitiatedAt = :timestamp, contactId = :contactId',
            ExpressionAttributeNames={
                '#status': 'status'
            },
            ExpressionAttributeValues={
                ':status': status,
                ':timestamp': datetime.now().isoformat(),
                ':contactId': call_result.get('ContactId', 'N/A')
            }
        )
        print(f"✅ Reminder status updated for order: {order_id}")
    except Exception as e:
        print(f"❌ Error updating reminder status: {str(e)}")
