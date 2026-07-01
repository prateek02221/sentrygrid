import random

THREAT_TYPES = [
    "failed_login",
    "brute_force",
    "suspicious_ip",
    "unknown_location",
    "traffic_spike",
    "unauthorized_access"
]

COUNTRIES = [
    "India",
    "Russia",
    "China",
    "Brazil",
    "Germany",
    "United States",
    "United Kingdom",
    "North Korea",
    "Iran",
    "Ukraine"
]


def generate_random_event():

    threat_type = random.choice(
        THREAT_TYPES
    )

    if random.random() < 0.30:

        ip_address = (
            f"185.220.101."
            f"{random.randint(1, 50)}"
        )

    else:

        ip_address = ".".join(
            str(random.randint(1, 255))
            for _ in range(4)
        )

    return {
        "event_type": threat_type,

        "ip_address": ip_address,

        "country": random.choice(
            COUNTRIES
        ),

        "description":
            f"Detected {threat_type}"
    }