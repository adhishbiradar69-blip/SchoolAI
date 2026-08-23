from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import user, school, class_, student, attendance, task, mark, subject
from app.routers import auth, admin, attendance, tasks, academics

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(attendance.router)
app.include_router(tasks.router)
app.include_router(academics.router)

@app.get("/")
def root():
    return {"status": "running"}