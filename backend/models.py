from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from database import Base


class EventType(str, enum.Enum):
    birthday = "birthday"
    anniversary = "anniversary"
    custom = "custom"


class Recurrence(str, enum.Enum):
    yearly = "yearly"
    once = "once"
    none = "none"


class NoteCategory(str, enum.Enum):
    favorites = "favorites"
    gift_ideas = "gift_ideas"
    general = "general"


class ActionType(str, enum.Enum):
    sent_birthday = "sent_birthday"
    received_birthday = "received_birthday"
    sent_gift = "sent_gift"
    received_gift = "received_gift"
    sent_message = "sent_message"
    received_message = "received_message"
    hung_out = "hung_out"


class Friend(Base):
    __tablename__ = "friends"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    birthday = Column(Date, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    events = relationship("Event", back_populates="friend", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="friend", cascade="all, delete-orphan")
    reciprocity_logs = relationship("ReciprocityLog", back_populates="friend", cascade="all, delete-orphan")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    friend_id = Column(Integer, ForeignKey("friends.id"), nullable=False)
    title = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    event_type = Column(String, default=EventType.custom.value)
    recurrence = Column(String, default=Recurrence.none.value)
    reminder_days_before = Column(Integer, default=7)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    friend = relationship("Friend", back_populates="events")


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    friend_id = Column(Integer, ForeignKey("friends.id"), nullable=False)
    category = Column(String, default=NoteCategory.general.value)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    friend = relationship("Friend", back_populates="notes")


class ReciprocityLog(Base):
    __tablename__ = "reciprocity_logs"

    id = Column(Integer, primary_key=True, index=True)
    friend_id = Column(Integer, ForeignKey("friends.id"), nullable=False)
    action = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    friend = relationship("Friend", back_populates="reciprocity_logs")
