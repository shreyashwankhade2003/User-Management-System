import json
import urllib.request
import urllib.error

url = 'http://localhost:5000/api/auth/signup'
payload = {
    'name': 'Test User',
    'email': 'testuser@example.com',
    'mobile': '9876543210',
    'aadhar': '123456789012',
    'password': 'password123'
}
req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req, timeout=10) as r:
        print('STATUS', r.status)
        print(r.read().decode())
except urllib.error.HTTPError as e:
    print('STATUS', e.code)
    print(e.read().decode())
except Exception as e:
    print('ERROR', e)
