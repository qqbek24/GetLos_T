"""
Test script to verify backend setup
Run: python test_backend.py
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_root():
    """Test root endpoint"""
    response = requests.get(f"{BASE_URL}/")
    print(f"✓ Root endpoint: {response.json()}")
    return response.status_code == 200

def test_stats():
    """Test stats endpoint"""
    response = requests.get(f"{BASE_URL}/stats")
    print(f"✓ Stats endpoint: {response.json()}")
    return response.status_code == 200

def test_generate():
    """Test generate endpoint"""
    payload = {
        "strategy": "random",
        "count": 1
    }
    response = requests.post(f"{BASE_URL}/generate", json=payload)
    result = response.json()
    print(f"✓ Generate endpoint: {result}")
    return response.status_code == 200 and len(result) == 1

def test_picks():
    """Test picks list"""
    response = requests.get(f"{BASE_URL}/picks")
    result = response.json()
    print(f"✓ Picks endpoint: Found {len(result)} picks")
    return response.status_code == 200

def main():
    print("=" * 50)
    print("Testing GetLos_T Backend")
    print("=" * 50)
    print()
    
    tests = [
        ("Root Endpoint", test_root),
        ("Stats Endpoint", test_stats),
        ("Generate Endpoint", test_generate),
        ("Picks List", test_picks),
    ]
    
    passed = 0
    failed = 0
    
    for name, test_func in tests:
        print(f"\nTesting: {name}")
        try:
            if test_func():
                print(f"✅ {name} PASSED")
                passed += 1
            else:
                print(f"❌ {name} FAILED")
                failed += 1
        except Exception as e:
            print(f"❌ {name} FAILED with error: {e}")
            failed += 1
    
    print()
    print("=" * 50)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 50)
    
    if failed == 0:
        print("🎉 All tests passed!")
    else:
        print("⚠️ Some tests failed. Check backend logs.")

if __name__ == "__main__":
    main()
