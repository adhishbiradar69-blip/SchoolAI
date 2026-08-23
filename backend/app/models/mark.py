from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database import Base

class Mark(Base):
    __tablename__ = "marks"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject_id = Column(Integer, nullable=True)
    exam_name = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    max_score = Column(Float, default=100)
    term = Column(String, nullable=True)