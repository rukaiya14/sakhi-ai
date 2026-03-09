#!/usr/bin/env python3
"""
Test script for SkillScan AI backend
Tests the deployed Lambda functions and API endpoints
"""

import json
import base64
import requests
import sys
from pathlib import Path

# Configuration
API_ENDPOINT = "https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/production"
TEST_ARTISAN_ID = "test-artisan-001"
TEST_CATEGORY = "embroidery"

def load_test_image():
    """
    Load a test image and convert to base64
    You can replace this with your own test image path
    """
    # Create a simple 1x1 pixel test image in base64
    # In production, replace with actual image file
    test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    return test_image_base64

def test_analyze_endpoint():
    """
    Test the /analyze endpoint
    """
    print("=" * 60)
    print("Testing SkillScan Analysis Endpoint")
    print("=" * 60)
    
    # Prepare test data
    test_image = load_test_image()
    
    payload = {
        "artisan_id": TEST_ARTISAN_ID,
        "category": TEST_CATEGORY,
        "images": [test_image]
    }
    
    print(f"\n📤 Sending request to: {API_ENDPOINT}/analyze")
    print(f"   Artisan ID: {TEST_ARTISAN_ID}")
    print(f"   Category: {TEST_CATEGORY}")
    print(f"   Images: 1 test image")
    
    try:
        response = requests.post(
            f"{API_ENDPOINT}/analyze",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        print(f"\n📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ SUCCESS! Analysis completed")
            print("\nResponse:")
            print(json.dumps(result, indent=2))
            
            if result.get('success') and result.get('analysis'):
                analysis = result['analysis']
                print("\n" + "=" * 60)
                print("Analysis Summary:")
                print("=" * 60)
                print(f"Overall Score: {analysis.get('overall_score', 'N/A')}")
                print(f"Skill Level: {analysis.get('skill_level', 'N/A')}")
                print(f"Category: {analysis.get('category', 'N/A')}")
                
                if 'breakdown' in analysis:
                    print("\nScore Breakdown:")
                    for key, value in analysis['breakdown'].items():
                        print(f"  - {key}: {value}")
                
                if 'strengths' in analysis:
                    print("\nStrengths:")
                    for strength in analysis['strengths']:
                        print(f"  ✓ {strength}")
                
                if 'improvements' in analysis:
                    print("\nAreas for Improvement:")
                    for improvement in analysis['improvements']:
                        print(f"  → {improvement}")
                
                print("\n" + "=" * 60)
                return True
        else:
            print(f"\n❌ FAILED with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("\n❌ Request timed out (this is normal for first run - cold start)")
        print("   Try running the test again")
        return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

def test_get_skillscans_endpoint():
    """
    Test the /skillscans endpoint
    """
    print("\n" + "=" * 60)
    print("Testing Get SkillScans Endpoint")
    print("=" * 60)
    
    print(f"\n📤 Sending request to: {API_ENDPOINT}/skillscans")
    
    try:
        response = requests.get(
            f"{API_ENDPOINT}/skillscans",
            params={"limit": 10},
            timeout=30
        )
        
        print(f"\n📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ SUCCESS! Retrieved SkillScans")
            
            skillscans = result.get('skillscans', [])
            count = result.get('count', 0)
            
            print(f"\nTotal SkillScans: {count}")
            
            if skillscans:
                print("\nRecent SkillScans:")
                for i, scan in enumerate(skillscans[:5], 1):
                    print(f"\n{i}. Artisan: {scan.get('artisan_id', 'N/A')}")
                    print(f"   Category: {scan.get('category', 'N/A')}")
                    print(f"   Score: {scan.get('analysis', {}).get('overall_score', 'N/A')}")
                    print(f"   Date: {scan.get('timestamp', 'N/A')}")
            else:
                print("\nNo SkillScans found yet. Run the analyze test first!")
            
            return True
        else:
            print(f"\n❌ FAILED with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

def check_configuration():
    """
    Check if configuration is set up correctly
    """
    print("=" * 60)
    print("Checking Configuration")
    print("=" * 60)
    
    if "YOUR-API-ID" in API_ENDPOINT:
        print("\n❌ ERROR: API_ENDPOINT not configured!")
        print("\nPlease update the API_ENDPOINT variable in this script with your actual API Gateway endpoint.")
        print("You can find it in the deployment output or CloudFormation stack outputs.")
        print("\nExample:")
        print('API_ENDPOINT = "https://abc123xyz.execute-api.us-east-1.amazonaws.com/production"')
        return False
    
    print(f"\n✅ API Endpoint configured: {API_ENDPOINT}")
    return True

def main():
    """
    Main test function
    """
    print("\n" + "=" * 60)
    print("SkillScan AI Backend Test Suite")
    print("=" * 60)
    
    # Check configuration
    if not check_configuration():
        sys.exit(1)
    
    # Run tests
    print("\n\nStarting tests...\n")
    
    results = {
        "analyze": False,
        "get_skillscans": False
    }
    
    # Test 1: Analyze endpoint
    results["analyze"] = test_analyze_endpoint()
    
    # Test 2: Get SkillScans endpoint
    results["get_skillscans"] = test_get_skillscans_endpoint()
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n🎉 All tests passed! Your SkillScan AI backend is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the error messages above.")
        print("\nCommon issues:")
        print("  1. API endpoint not configured correctly")
        print("  2. AWS Bedrock model access not enabled")
        print("  3. Lambda function cold start (retry once)")
        print("  4. CORS configuration issue")
    
    print("\n" + "=" * 60)
    
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main()
