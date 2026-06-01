import ipaddress
import re
from django.conf import settings
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin


class CampusNetworkMiddleware(MiddlewareMixin):
    """
    Middleware que valida que las peticiones al endpoint de captura de
    asistencia provengan de la red universitaria (RF06).
    """

    PROTECTED_PATHS = [
        r"^/api/v1/attendance/records/capture/$",
    ]

    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.allowed_ranges = self._load_allowed_ranges()

    def _load_allowed_ranges(self):
        default = [
            "10.0.0.0/8",
            "172.16.0.0/12",
            "192.168.0.0/16",
        ]
        custom = getattr(settings, "CAMPUS_NETWORK_RANGES", default)
        return [ipaddress.ip_network(r, strict=False) for r in custom]

    def _is_campus_ip(self, ip_str):
        try:
            ip = ipaddress.ip_address(ip_str)
            return any(ip in network for network in self.allowed_ranges)
        except ValueError:
            return False

    def process_view(self, request, view_func, view_args, view_kwargs):
        path = request.path_info
        is_protected = any(re.match(pattern, path) for pattern in self.PROTECTED_PATHS)

        if not is_protected:
            return None

        if request.method != "POST":
            return None

        ip = self._get_client_ip(request)

        if not self._is_campus_ip(ip):
            return JsonResponse(
                {
                    "detail": "No es posible registrar tu asistencia desde fuera de la red universitaria."
                },
                status=403,
            )

        return None

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "0.0.0.0")
