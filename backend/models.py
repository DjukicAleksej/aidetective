from typing import List, Optional
import uuid
from pydantic import BaseModel, Field


# Cases models
class ShortCaseModel(BaseModel):
    id: uuid.UUID
    name: str
    short_description: str = Field(
        default="",
        description="Brief description of the case"
    )

class ShortCaseInputModel(BaseModel):
    name: str = Field(..., description="Name of the case")
    short_description: str = Field(
        default="",
        description="Brief description of the case"
    )

class CaseInputModel(BaseModel):
    caseid: uuid.UUID = Field(..., description="ID of the case")

class CaseUpdateModel(BaseModel):
    name: Optional[str] = Field(None, description="Name of the case")
    short_description: Optional[str] = Field(None, description="Brief description of the case")
    detective: Optional[str] = Field(None, description="Detective assigned to the case")

# Party models
class PartyModel(BaseModel):
    name: str = Field(..., description="Name of the party")
    description: Optional[str] = Field(
        default=None,
        title="Description of the party"
    )
    alibi: Optional[str] = Field(
        default=None,
        title="Alibi of the party"
    )
    role: Optional[str] = Field(
        default=None,
        title="Role that they have in the case (suspect, victim, detective...)"
    )
    image: str = Field(
        title="Endpoint that may contains the image (optional)"
    )

class PartyResponseModel(BaseModel):
    id: uuid.UUID = Field(..., description="Unique identifier for the party")
    name: str = Field(..., description="Name of the party")
    description: Optional[str] = Field(None, description="Description of the party")
    alibi: Optional[str] = Field(None, description="Alibi of the party")
    role: Optional[str] = Field(None, description="Role in the case")
    image: str = Field(..., description="Endpoint for party image")

class PartyInputModel(BaseModel):
    caseid: uuid.UUID = Field(..., description="ID of the case")
    name: str = Field(..., description="Name of the party")
    role: str = Field(..., description="Role in the case")
    description: Optional[str] = Field(None, description="Description of the party")
    alibi: Optional[str] = Field(None, description="Alibi of the party")

class PartyUpdateModel(BaseModel):
    partyid: uuid.UUID = Field(..., description="ID of the party to update")
    name: Optional[str] = Field(None, description="Name of the party")
    role: Optional[str] = Field(None, description="Role in the case")
    description: Optional[str] = Field(None, description="Description of the party")
    alibi: Optional[str] = Field(None, description="Alibi of the party")

# Evidence models
class EvidenceModel(BaseModel):
    id: uuid.UUID = Field(..., description="Unique identifier for the evidence")
    case_id: uuid.UUID = Field(..., description="ID of the case")
    status: str = Field(..., description="Status of the evidence")
    place: Optional[str] = Field(None, description="Location where evidence was found")
    description: Optional[str] = Field(None, description="Description of the evidence")
    name: str = Field(..., description="Name of the evidence")
    suspects: Optional[List[uuid.UUID]] = Field(
        default_factory=list,
        description="List of suspect IDs related to this evidence"
    )

class EvidenceInputModel(BaseModel):
    caseid: uuid.UUID = Field(..., description="ID of the case")
    name: str = Field(..., description="Name of the evidence")
    status: Optional[str] = Field("unknown", description="Status of the evidence")
    place: Optional[str] = Field(None, description="Location where evidence was found")
    description: Optional[str] = Field(None, description="Description of the evidence")
    suspects: Optional[List[uuid.UUID]] = Field(
        default_factory=list,
        description="List of suspect IDs"
    )

class EvidenceUpdateModel(BaseModel):
    id: uuid.UUID = Field(..., description="ID of the evidence to update")
    name: Optional[str] = Field(None, description="Name of the evidence")
    status: Optional[str] = Field(None, description="Status of the evidence")
    place: Optional[str] = Field(None, description="Location where evidence was found")
    description: Optional[str] = Field(None, description="Description of the evidence")
    suspects: Optional[List[uuid.UUID]] = Field(None, description="List of suspect IDs")

# Theory models
class TheoryModel(BaseModel):
    id: uuid.UUID = Field(..., description="Unique identifier for the theory")
    name: str = Field(..., description="Name of the theory")
    content: str = Field(..., description="Content/details of the theory")

class TheoryInputModel(BaseModel):
    caseid: uuid.UUID = Field(..., description="ID of the case")
    name: str = Field(..., description="Name of the theory")
    content: Optional[str] = Field("", description="Content/details of the theory")

class TheoryUpdateModel(BaseModel):
    id: uuid.UUID = Field(..., description="ID of the theory to update")
    name: Optional[str] = Field(None, description="Name of the theory")
    content: Optional[str] = Field(None, description="Content/details of the theory")

# Timeline models
class TimelineEventModel(BaseModel):
    id: uuid.UUID = Field(..., description="Unique identifier for the timeline event")
    case_id: uuid.UUID = Field(..., description="ID of the case")
    timestamp: int = Field(..., description="Timestamp in milliseconds")
    place: str = Field(..., description="Location of the event")
    status: str = Field(..., description="Status of the event")
    name: str = Field(..., description="Name of the event")
    description: Optional[str] = Field(None, description="Description of the event")

class TimelineEventInputModel(BaseModel):
    caseid: uuid.UUID = Field(..., description="ID of the case")
    timestamp: int = Field(..., description="Timestamp in milliseconds")
    place: Optional[str] = Field("unknown", description="Location of the event")
    status: str = Field(..., description="Status of the event")
    name: str = Field(..., description="Name of the event")
    description: Optional[str] = Field(None, description="Description of the event")

class TimelineEventUpdateModel(BaseModel):
    id: uuid.UUID = Field(..., description="ID of the timeline event to update")
    timestamp: Optional[int] = Field(None, description="Timestamp in milliseconds")
    place: Optional[str] = Field(None, description="Location of the event")
    status: Optional[str] = Field(None, description="Status of the event")
    name: Optional[str] = Field(None, description="Name of the event")
    description: Optional[str] = Field(None, description="Description of the event")

# Response models
class SuccessResponse(BaseModel):
    success: bool = Field(..., description="Whether the operation was successful")

class IDResponse(BaseModel):
    id: str = Field(..., description="ID of the created resource")
