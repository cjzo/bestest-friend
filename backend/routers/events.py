from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import date, timedelta

from database import get_db
from models import Event, Friend
from schemas import EventCreate, EventUpdate, EventRead, EventWithFriend

router = APIRouter(tags=["events"])


@router.get("/api/friends/{friend_id}/events", response_model=list[EventRead])
def list_events_for_friend(friend_id: int, db: Session = Depends(get_db)):
    friend = db.query(Friend).filter(Friend.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    return db.query(Event).filter(Event.friend_id == friend_id).order_by(Event.date).all()


@router.post("/api/friends/{friend_id}/events", response_model=EventRead, status_code=201)
def create_event(friend_id: int, payload: EventCreate, db: Session = Depends(get_db)):
    friend = db.query(Friend).filter(Friend.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    event = Event(friend_id=friend_id, **payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/api/events/upcoming", response_model=list[EventWithFriend])
def get_upcoming_events(days: int = 30, db: Session = Depends(get_db)):
    """Get events happening in the next N days. Handles yearly recurrence by
    checking if the event's month/day falls within the window."""
    today = date.today()
    end_date = today + timedelta(days=days)

    events = db.query(Event).options(joinedload(Event.friend)).all()
    upcoming = []

    for event in events:
        event_date = event.date
        if event.recurrence == "yearly":
            # Check this year and next year
            for year in [today.year, today.year + 1]:
                try:
                    this_year_date = event_date.replace(year=year)
                except ValueError:
                    # Feb 29 in non-leap year
                    this_year_date = event_date.replace(year=year, day=28)
                if today <= this_year_date <= end_date:
                    upcoming.append((this_year_date, event))
                    break
        else:
            if today <= event_date <= end_date:
                upcoming.append((event_date, event))

    upcoming.sort(key=lambda x: x[0])
    return [e for _, e in upcoming]


@router.put("/api/events/{event_id}", response_model=EventRead)
def update_event(event_id: int, payload: EventUpdate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, key, value)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/api/events/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
