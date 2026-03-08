import boto3
import json

lambda_client = boto3.client('lambda', region_name='us-east-1')

def test_voice_call(order_id):
    """Test voice call generation"""
    
    print(f"Testing voice call for order: {order_id}")
    print("-" * 60)
    
    payload = {
        'orderId': order_id
    }
    
    try:
        response = lambda_client.invoke(
            FunctionName='shebalance-voice-call-service',
            InvocationType='RequestResponse',
            Payload=json.dumps(payload)
        )
        
        result = json.loads(response['Payload'].read())
        
        print("\nResponse:")
        print(json.dumps(result, indent=2))
        
        if result.get('statusCode') == 200:
            print("\n✅ Voice call test successful!")
            body = json.loads(result['body'])
            print(f"\n   Contact ID: {body.get('contactId')}")
            print(f"   Phone: {body.get('phoneNumber')}")
            print(f"   Language: {body.get('language')}")
            print(f"   Audio URL: {body.get('audioUrl')[:80]}...")
            print(f"\n   Voice Script:")
            print(f"   {'-' * 60}")
            script = body.get('script', '').replace('<speak>', '').replace('</speak>', '')
            script = script.replace('<prosody rate="medium" pitch="medium">', '')
            script = script.replace('</prosody>', '')
            script = script.replace('<break time="500ms"/>', ' ')
            script = script.replace('<break time="1s"/>', '\n   ')
            print(f"   {script.strip()}")
        else:
            print("\n❌ Voice call test failed!")
            print(f"   Error: {result.get('body')}")
        
        return result
        
    except Exception as e:
        print(f"\n❌ Error invoking Lambda: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

# Test with sample orders
print("=" * 60)
print("Voice Service Test")
print("=" * 60)
print()

# Test order 1
result1 = test_voice_call('order-1234567890-1')

print("\n" + "=" * 60)
print()

# Optionally test another order
# result2 = test_voice_call('order-1234567890-2')

print("\nTest complete!")
print("\nNote: If Amazon Connect is not configured, the call will be")
print("simulated and you'll see a 'simulated-' contact ID.")
print("\nTo enable real calls, follow the setup guide in:")
print("VOICE_SERVICES_IMPLEMENTATION.md")
