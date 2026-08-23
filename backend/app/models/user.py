from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)
    school_id = Column(Integer, nullable=True)
    assigned_class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)