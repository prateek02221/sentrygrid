from slowapi import Limiter
from starlette.requests import Request


def get_real_client_ip(request: Request) -> str:
    """
    Returns the real visitor IP, not the reverse proxy's.

    Render (and most hosting platforms) sit in front of the app as a
    reverse proxy, so `request.client.host` reflects the proxy's internal
    connection rather than the actual visitor. The real IP is instead
    passed along in the `X-Forwarded-For` header. Without this, every
    visitor would appear to share one IP, and one person failing login
    a few times could rate-limit everyone else too.

    Locally (no proxy in front), there's no X-Forwarded-For header, so
    this falls back to the direct connection IP as normal.
    """
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        # This header can be a comma-separated chain if multiple proxies
        # are involved (client, proxy1, proxy2, ...) - the first entry is
        # the original visitor.
        return forwarded_for.split(",")[0].strip()

    return request.client.host if request.client else "unknown"


# Shared rate limiter instance.
# Lives in its own module (rather than main.py) so route files can import
# and use it directly without creating a circular import with main.py.
limiter = Limiter(key_func=get_real_client_ip)
