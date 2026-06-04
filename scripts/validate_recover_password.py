import os
import django
from unittest.mock import patch

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sacarf.settings')
os.environ.setdefault('USE_POSTGRES', 'False')

import sys
sys.path.append('backend')

django.setup()

from rest_framework.test import APIRequestFactory
from apps.accounts.views import AuthViewSet
from apps.accounts.models import User

user = User.objects.first()
if not user:
    raise SystemExit('No hay usuarios para probar')

factory = APIRequestFactory()
request = factory.post('/api/v1/auth/recover-password/', {'email': user.email}, format='json')
view = AuthViewSet.as_view({'post': 'recover_password'})

with patch('cloud.ses.send_recovery_email', return_value=False):
    response = view(request)

print(response.status_code)
print(response.data)
