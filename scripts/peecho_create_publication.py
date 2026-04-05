#!/usr/bin/env python3
"""
Peecho V3 API - Create Publication
Using the correct endpoint from the official APIB documentation
"""

import urllib.request
import urllib.error
import json
from datetime import datetime

API_KEY = "9453a60bbb4ff78d9543640832a5980a2f52f4bd"
IMAGE_URL = "https://res.cloudinary.com/dwrdcthuz/image/upload/v1775334352/dzine-orders/to33vgivogvv2op4invw.png"

# Try PROD endpoint (the API key might belong to prod, not test)
ENDPOINT = "https://www.peecho.com/rest/v3/publication/create"

def create_publication():
    """Create a publication via Peecho V3 API"""
    
    payload = {
        "apiKey": API_KEY,
        "currency": "EUR",
        "locale": "en",
        "enableSecureCheckout": True,  # Enable secure checkout for live link
        "order": {
            "reference": f"test-publication-{datetime.now().timestamp()}",
            "product": {
                "title": "Test Dzine Publication",
                "source": {
                    "file": {
                        "src": IMAGE_URL,
                        "pages": 1,
                        "dimensions": {
                            "width": 210,
                            "height": 297
                        }
                    }
                },
                "thumbnail": {
                    "src": IMAGE_URL
                }
            }
        }
    }
    
    headers = {
        "Content-Type": "application/json",
    }
    
    print("="*80)
    print("PEECHO V3 API - CREATE PUBLICATION")
    print("="*80)
    print(f"Endpoint: {ENDPOINT}")
    print(f"Time: {datetime.now()}")
    print(f"API Key: {API_KEY[:20]}...")
    
    print(f"\nPayload:")
    print(json.dumps(payload, indent=2))
    
    data = json.dumps(payload).encode('utf-8')
    
    try:
        req = urllib.request.Request(ENDPOINT, data=data, headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=10) as response:
            body = response.read().decode('utf-8')
            status = response.status
            
            print(f"\n{'='*80}")
            print(f"RESPONSE")
            print(f"{'='*80}")
            print(f"Status: {status}")
            
            # Try to parse JSON
            try:
                json_body = json.loads(body)
                print(f"✅ SUCCESS - JSON Response:")
                print(json.dumps(json_body, indent=2))
                
                # Extract publication ID and secure checkout link
                if isinstance(json_body, dict) and 'secure_publication_id' in json_body:
                    pub_id = json_body.get('secure_publication_id')
                    token = json_body.get('token')
                    checkout_url = f"https://www.peecho.com/checkout/print/en/{pub_id}?token={token}"
                    print(f"\n✅ Publication created with secure checkout!")
                    print(f"Secure Publication ID: {pub_id}")
                    print(f"Token: {token}")
                    print(f"\n🔗 Live Checkout URL:")
                    print(f"{checkout_url}")
                elif isinstance(json_body, (int, str)):
                    print(f"\n✅ Publication ID: {json_body}")
                    checkout_url = f"https://www.peecho.com/print/{json_body}"
                    print(f"Checkout URL: {checkout_url}")
                
                return json_body
            except json.JSONDecodeError:
                print(f"Response (non-JSON, {len(body)} bytes):")
                print(body[:300])
                return body
    
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print(f"\n❌ HTTP {e.code}")
        print(f"Response:")
        
        try:
            json_body = json.loads(body)
            print(json.dumps(json_body, indent=2))
        except:
            print(body[:500])
        
        return None
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return None

if __name__ == "__main__":
    result = create_publication()
