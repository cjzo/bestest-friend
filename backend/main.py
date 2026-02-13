from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import random

from database import engine, get_db, Base
from models import Friend, Note
from schemas import ChatRequest, ChatResponse
from routers import friends, events, notes, reciprocity

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bestest Friend API")

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(friends.router)
app.include_router(events.router)
app.include_router(notes.router)
app.include_router(reciprocity.router)


@app.get("/")
def read_root():
    return {"message": "Bestest Friend API"}


@app.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    """Simple rule-based suggestion engine. Returns gift ideas and message templates."""
    message = payload.message.lower()
    friend_name = None

    if payload.friend_id:
        friend = db.query(Friend).filter(Friend.id == payload.friend_id).first()
        if friend:
            friend_name = friend.name
            # Pull notes for context
            friend_notes = db.query(Note).filter(
                Note.friend_id == payload.friend_id,
                Note.category == "favorites"
            ).all()

    suggestions = []

    if any(word in message for word in ["gift", "present", "buy"]):
        gift_ideas = [
            "A handwritten letter with a small care package",
            "A custom playlist of songs that remind you of them",
            "A book you think they would love",
            "A cozy blanket or mug with a personal touch",
            "A gift card to their favorite restaurant or store",
            "A framed photo of a memory you share",
            "A subscription to something they enjoy (coffee, streaming, etc.)",
        ]
        if friend_name:
            reply = f"Here are some gift ideas for {friend_name}:"
        else:
            reply = "Here are some gift ideas:"

        # If we have notes about their favorites, mention them
        if payload.friend_id and friend_notes:
            favorites = [n.content for n in friend_notes[:3]]
            reply += f"\n\nBased on your notes, they like: {', '.join(favorites)}"

        suggestions = random.sample(gift_ideas, min(3, len(gift_ideas)))

    elif any(word in message for word in ["birthday", "wish", "happy"]):
        birthday_messages = [
            "Wishing you the happiest of birthdays! Hope this year brings you everything you deserve.",
            "Happy birthday! So grateful to have you as a friend.",
            "Another year of being awesome — happy birthday!",
            "Happy birthday! Let's celebrate you today and every day.",
            "Cheers to another amazing year! Happy birthday, friend.",
        ]
        reply = f"Here are some birthday message ideas{f' for {friend_name}' if friend_name else ''}:"
        suggestions = random.sample(birthday_messages, min(3, len(birthday_messages)))

    elif any(word in message for word in ["thank", "grateful", "appreciate"]):
        thank_messages = [
            "Just wanted to say thanks for being such an amazing friend. You really make a difference.",
            "I appreciate you more than you know. Thank you for always being there.",
            "Grateful for your friendship — you're one of the good ones.",
        ]
        reply = "Here are some ways to express gratitude:"
        suggestions = thank_messages

    elif any(word in message for word in ["check in", "reach out", "say hi", "catch up"]):
        checkin_messages = [
            "Hey! Just thinking about you — how have you been?",
            "It's been a while! Want to grab coffee/lunch sometime soon?",
            "Hope you're doing well! Just wanted to check in.",
            "Miss hanging out — let's catch up soon!",
        ]
        reply = "Here are some ways to reach out:"
        suggestions = random.sample(checkin_messages, min(3, len(checkin_messages)))

    else:
        reply = "I can help you with gift ideas, birthday messages, thank you notes, or check-in messages. Try asking me something like 'gift ideas for their birthday' or 'how to say thank you'."
        suggestions = [
            "Try: 'Gift ideas for my friend'",
            "Try: 'Birthday wish for a close friend'",
            "Try: 'How to check in with a friend'",
        ]

    return ChatResponse(reply=reply, suggestions=suggestions)