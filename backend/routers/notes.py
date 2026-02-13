from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Note, Friend
from schemas import NoteCreate, NoteUpdate, NoteRead

router = APIRouter(tags=["notes"])


@router.get("/api/friends/{friend_id}/notes", response_model=list[NoteRead])
def list_notes_for_friend(friend_id: int, category: str = "", db: Session = Depends(get_db)):
    friend = db.query(Friend).filter(Friend.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    query = db.query(Note).filter(Note.friend_id == friend_id)
    if category:
        query = query.filter(Note.category == category)
    return query.order_by(Note.created_at.desc()).all()


@router.post("/api/friends/{friend_id}/notes", response_model=NoteRead, status_code=201)
def create_note(friend_id: int, payload: NoteCreate, db: Session = Depends(get_db)):
    friend = db.query(Friend).filter(Friend.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    note = Note(friend_id=friend_id, **payload.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/api/notes/{note_id}", response_model=NoteRead)
def update_note(note_id: int, payload: NoteUpdate, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(note, key, value)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/api/notes/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
