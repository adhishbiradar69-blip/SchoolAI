from pydantic import BaseModel
from typing import Optional

class SchoolCreate(BaseModel):
    name: str

class ClassCreate(BaseModel):
    school_id: int
    grade: str
    section: str

class StudentCreate(BaseModel):
    name: str
    roll_no: Optional[str] = None
    class_id: int