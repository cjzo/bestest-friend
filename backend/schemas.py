from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


# ---------- Friend ----------
class FriendCreate(BaseModel):
    name: str
    birthday: Optional[date] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    photo_url: Optional[str] = None


class FriendUpdate(BaseModel):
    name: Optional[str] = None
    birthday: Optional[date] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    photo_url: Optional[str] = None


class FriendRead(BaseModel):
    id: int
    name: str
    birthday: Optional[date] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---------- Event ----------
class EventCreate(BaseModel):
    title: str
    date: date
    event_type: str = "custom"
    recurrence: str = "none"
    reminder_days_before: int = 7


class EventUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[date] = None
    event_type: Optional[str] = None
    recurrence: Optional[str] = None
    reminder_days_before: Optional[int] = None


class EventRead(BaseModel):
    id: int
    friend_id: int
    title: str
    date: date
    event_type: str
    recurrence: str
    reminder_days_before: int
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class EventWithFriend(EventRead):
    friend: FriendRead

    model_config = {"from_attributes": True}


# ---------- Note ----------
class NoteCreate(BaseModel):
    category: str = "general"
    content: str


class NoteUpdate(BaseModel):
    category: Optional[str] = None
    content: Optional[str] = None


class NoteRead(BaseModel):
    id: int
    friend_id: int
    category: str
    content: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---------- ReciprocityLog ----------
class ReciprocityCreate(BaseModel):
    action: str
    date: date
    notes: Optional[str] = None


class ReciprocityRead(BaseModel):
    id: int
    friend_id: int
    action: str
    date: date
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---------- Chat ----------
class ChatRequest(BaseModel):
    message: str
    friend_id: Optional[int] = None


class ChatResponse(BaseModel):
    reply: str
    suggestions: list[str] = []
