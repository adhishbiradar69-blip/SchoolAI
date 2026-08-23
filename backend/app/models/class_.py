from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Class(Base):
    __tablename__ = "classes"
    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id"))
    grade = Column(String, nullable=False)
    section = Column(String, nullable=False)
    class_teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)