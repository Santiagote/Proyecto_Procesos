import urllib.request
import urllib.error

url = 'http://localhost:8000/api/v1/students/careers/'
req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req, timeout=5) as resp:
        print('STATUS', resp.status)
        print(resp.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('HTTP ERROR', e.code)
    try:
        print(e.read().decode('utf-8'))
    except:
        pass
except Exception as ex:
    print('ERROR', ex)
