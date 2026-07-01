from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class ThreatSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ThreatType(str, Enum):
    FAILED_LOGIN = "failed_login"
    BRUTE_FORCE = "brute_force"
    SUSPICIOUS_IP = "suspicious_ip"
    UNKNOWN_LOCATION = "unknown_location"
    TRAFFIC_SPIKE = "traffic_spike"
    UNAUTHORIZED_ACCESS = "unauthorized_access"


class ThreatLogResponse(BaseModel):
    id: Optional[str] = None
    event_type: ThreatType
    ip_address: str
    country: str
    risk_score: int
    severity: ThreatSeverity
    description: str
    status: str
    created_at: datetime