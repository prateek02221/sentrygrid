from pydantic import BaseModel


class IncidentStatusUpdate(BaseModel):
    status: str
class IncidentNoteRequest(BaseModel):
    note: str