from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Friend
from schemas import FriendCreate, FriendUpdate, FriendRead

router = APIRouter(prefix="/api/friends", tags=["friends"])


@router.get("", response_model=list[FriendRead])
def list_friends(q: str = "", db: Session = Depends(get_db)):
    query = db.query(Friend)
    if q:
        query = query.filter(Friend.name.ilike(f"%{q}%"))
    return query.order_by(Friend.name).all()


@router.post("", response_model=FriendRead, status_code=201)
def create_friend(payload: FriendCreate, db: Session = Depends(get_db)):
    friend = Friend(**payload.model_dump())
    db.add(friend)
    db.commit()
    db.refresh(friend)
    return friend


@router.get("/{friend_id}", response_model=FriendRead)
def get_friend(friend_id: int, db: Session = Depends(get_db)):
    friend = db.query(Friend).filter(Friend.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    return friend


@router.put("/{friend_id}", response_model=FriendRead)
def update_friend(friend_id: int, payload: FriendUpdate, db: Session = Depends(get_db)):
    friend = db.query(Friend).filter(Friend.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(friend, key, value)
    db.commit()
    db.refresh(friend)
    return friend


@router.delete("/{friend_id}", status_code=204)
def delete_friend(friend_id: int, db: Session = Depends(get_db)):
    friend = db.query(Friend).filter(Friend.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    db.delete(friend)
    db.commit()
