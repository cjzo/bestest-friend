from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import ReciprocityLog, Friend
from schemas import ReciprocityCreate, ReciprocityRead

router = APIRouter(tags=["reciprocity"])


@router.get("/api/friends/{friend_id}/reciprocity", response_model=list[ReciprocityRead])
def list_reciprocity(friend_id: int, db: Session = Depends(get_db)):
    friend = db.query(Friend).filter(Friend.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    return (
        db.query(ReciprocityLog)
        .filter(ReciprocityLog.friend_id == friend_id)
        .order_by(ReciprocityLog.date.desc())
        .all()
    )


@router.post("/api/friends/{friend_id}/reciprocity", response_model=ReciprocityRead, status_code=201)
def log_reciprocity(friend_id: int, payload: ReciprocityCreate, db: Session = Depends(get_db)):
    friend = db.query(Friend).filter(Friend.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    log = ReciprocityLog(friend_id=friend_id, **payload.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/api/reciprocity/summary")
def reciprocity_summary(db: Session = Depends(get_db)):
    """Returns a summary of reciprocity per friend: counts of sent vs received actions."""
    logs = (
        db.query(
            ReciprocityLog.friend_id,
            Friend.name,
            ReciprocityLog.action,
            func.count(ReciprocityLog.id).label("count"),
        )
        .join(Friend)
        .group_by(ReciprocityLog.friend_id, Friend.name, ReciprocityLog.action)
        .all()
    )

    summary: dict = {}
    for friend_id, name, action, count in logs:
        if friend_id not in summary:
            summary[friend_id] = {"friend_id": friend_id, "name": name, "actions": {}}
        summary[friend_id]["actions"][action] = count

    return list(summary.values())
